import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import LipiaPaymentService from '@/lib/lipia';

export const dynamic = 'force-dynamic';

// POST: Initiate STK Push for order payment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone, amount, orderData } = await req.json();

    if (!phone || !amount || !orderData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate phone number
    const formattedPhone = LipiaPaymentService.formatPhoneNumber(phone);
    if (!LipiaPaymentService.isValidKenyanPhone(phone)) {
      return NextResponse.json({ 
        error: 'Invalid phone number. Please use a valid Safaricom number (07XX or 01XX)' 
      }, { status: 400 });
    }

    await dbConnect();

    // Calculate totals
    const subtotal = orderData.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    
    // Tiered shipping calculation
    let shipping = 0;
    if (subtotal < 1000) {
      shipping = 95;
    } else if (subtotal < 10000) {
      shipping = 125;
    } else if (subtotal < 20000) {
      shipping = 200;
    } else {
      shipping = 0; // Free shipping above 20k
    }
    
    const fee = subtotal * 0.0175; // 1.75% service fee
    const total = subtotal + shipping + fee;

    // Verify amount matches (allow 1 KSh tolerance for rounding)
    if (Math.abs(total - amount) > 1) {
      return NextResponse.json({ 
        error: 'Order amount mismatch' 
      }, { status: 400 });
    }

    // Fetch product details to check buyback eligibility
    const enrichedItems = await Promise.all(
      orderData.items.map(async (item: any) => {
        try {
          const product = await Product.findById(item.productId).lean();
          return {
            ...item,
            image: item.image || product?.images?.[0] || '/placeholder-product.png',
            buybackEligible: product?.buybackEnabled || false,
            buybackRequested: false,
          };
        } catch (error) {
          return {
            ...item,
            image: item.image || '/placeholder-product.png',
            buybackEligible: false,
            buybackRequested: false,
          };
        }
      })
    );

    // Generate order number
    const orderNumber = `GW-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create pending order
    const order = await Order.create({
      userId: session.user.id,
      orderNumber,
      items: enrichedItems,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: 'mpesa-stk',
      paymentStatus: 'pending',
      subtotal,
      shipping,
      fee,
      tax: 0, // No longer using tax
      total,
      status: 'pending-payment',
    });

    const externalReference = `ORDER_${order._id}`;

    // Initialize Lipia payment service
    const lipiaService = new LipiaPaymentService();

    // Get callback URL
    const baseUrl = process.env.PAYMENT_CALLBACK_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/api/orders/stk-callback`;

    try {
      // Initiate STK Push
      const stkPushResult = await lipiaService.initiateSTKPush({
        phone_number: formattedPhone,
        amount: Math.round(total),
        external_reference: externalReference,
        callback_url: callbackUrl,
        metadata: {
          user_id: session.user.id,
          order_id: order._id.toString(),
          type: 'order_payment',
          user_email: session.user.email,
        },
      });

      // Update order with transaction reference
      order.mpesaReference = stkPushResult.data.TransactionReference;
      await order.save();

      return NextResponse.json({
        success: true,
        message: 'STK push sent to your phone',
        transactionId: order._id.toString(),
        transactionReference: stkPushResult.data.TransactionReference,
        amount: total,
        phone: formattedPhone,
      });

    } catch (stkError: any) {
      // Update order status to failed
      order.paymentStatus = 'failed';
      order.status = 'cancelled';
      await order.save();

      return NextResponse.json(
        { 
          error: stkError.message || 'Failed to initiate payment',
          details: stkError.toString()
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Failed to process order payment',
      details: error.toString()
    }, { status: 500 });
  }
}
