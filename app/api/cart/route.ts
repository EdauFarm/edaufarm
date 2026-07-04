import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { authOptions } from '@/lib/auth';

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user cart
 *     description: Retrieve shopping cart for authenticated user
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const existingCart = await Cart.findOne({ userId: session.user.id }).lean();

    if (existingCart) {
      return NextResponse.json({ cart: existingCart });
    }

    const newCart = await Cart.create({ userId: session.user.id, items: [], total: 0 });
    const cart = newCart.toObject();

    return NextResponse.json({ cart });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch cart', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { productId, title, price, image, quantity, variant } = await request.json();

    if (!productId || !title || !price || !image || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let cart = await Cart.findOne({ userId: session.user.id });

    if (!cart) {
      cart = await Cart.create({
        userId: session.user.id,
        items: [{ productId, title, price, image, quantity, variant }],
      });
    } else {
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId && item.variant === variant
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, title, price, image, quantity, variant });
      }

      await cart.save();
    }

    return NextResponse.json({ message: 'Item added to cart', cart });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to add to cart', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { productId, quantity, variant } = await request.json();

    const cart = await Cart.findOne({ userId: session.user.id });

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.variant === variant
    );

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    return NextResponse.json({ message: 'Cart updated', cart });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update cart', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const cart = await Cart.findOne({ userId: session.user.id });

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    cart.items = [];
    await cart.save();

    return NextResponse.json({ message: 'Cart cleared', cart });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to clear cart', message: error.message },
      { status: 500 }
    );
  }
}
