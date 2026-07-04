import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.replace('Bearer ', '');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const { data: orders, error, count } = await supabase
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch orders', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch orders', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shippingAddress, paymentMethod, mpesaCode, mpesaPhone, buyerId, buyerEmail, buyerName } = body;

    if (!items || items.length === 0 || !shippingAddress || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userId = buyerId;
    const userEmail = buyerEmail;
    const userName = buyerName;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if ((paymentMethod === 'mpesa' || paymentMethod === 'wallet+mpesa') && (!mpesaCode || !/^[A-Z0-9]{10}$/.test(mpesaCode))) {
      return NextResponse.json({ error: 'Invalid M-Pesa confirmation code. Must be 10 alphanumeric characters.' }, { status: 400 });
    }

    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    let shipping = 0;
    if (subtotal < 1000) {
      shipping = 95;
    } else if (subtotal < 10000) {
      shipping = 125;
    } else if (subtotal < 20000) {
      shipping = 200;
    }

    const total = subtotal + shipping;

    const orderNumber = `MB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        buyer_id: userId,
        status: 'pending',
        payment_status: 'pending',
        payment_method: paymentMethod,
        payment_reference: mpesaCode || null,
        subtotal,
        shipping_fee: shipping,
        total,
        currency: 'KES',
        shipping_address: shippingAddress,
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Failed to create order', message: orderError?.message },
        { status: 500 }
      );
    }

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.title || item.name,
      product_image: item.image,
      quantity: item.quantity,
      unit_type: item.unit_type || 'piece',
      price: item.price,
      subtotal: item.price * item.quantity,
      seller_id: item.sellerId || null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Failed to create order items:', itemsError);
    }

    const { error: cartError } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (cartError) {
      console.error('Failed to clear cart:', cartError);
    }

    return NextResponse.json(
      { message: 'Order created successfully', order: { ...order, items: orderItems } },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create order', message: error.message },
      { status: 500 }
    );
  }
}
