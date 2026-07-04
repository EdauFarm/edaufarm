import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.replace('Bearer ', '');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: cartItems, error } = await supabase
      .from('cart')
      .select('*, products(*, categories(id, name, slug))')
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch cart', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      cart: {
        items: cartItems || [],
        total: cartItems?.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0) || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch cart', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.replace('Bearer ', '');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity } = await request.json();

    if (!productId || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: existingItem, error: fetchError } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to check cart', message: fetchError.message },
        { status: 500 }
      );
    }

    if (existingItem) {
      const { error: updateError } = await supabase
        .from('cart')
        .update({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingItem.id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update cart', message: updateError.message },
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from('cart')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
        });

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to add to cart', message: insertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: 'Item added to cart' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to add to cart', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.replace('Bearer ', '');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity } = await request.json();

    if (quantity <= 0) {
      const { error: deleteError } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (deleteError) {
        return NextResponse.json(
          { error: 'Failed to remove from cart', message: deleteError.message },
          { status: 500 }
        );
      }
    } else {
      const { error: updateError } = await supabase
        .from('cart')
        .update({
          quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update cart', message: updateError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: 'Cart updated' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update cart', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.replace('Bearer ', '');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to clear cart', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Cart cleared' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to clear cart', message: error.message },
      { status: 500 }
    );
  }
}
