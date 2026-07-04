import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Buyback from '@/models/Buyback';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import { ObjectId } from 'mongodb';
import { Resend } from 'resend';
import BuybackEmail from '@/lib/email-templates/BuybackEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = 'force-dynamic';

// GET: Get user's buyback requests
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const buybacks = await Buyback.find({ userId: user._id })
      .populate('productId', 'title image_url price')
      .populate('orderId', 'orderNumber createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ success: true, buybacks });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create buyback request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, productId, requestedAmount, reason, condition, images } = await req.json();

    if (!orderId || !productId || !requestedAmount || !reason || !condition) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    if (requestedAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!['excellent', 'good', 'fair', 'poor'].includes(condition)) {
      return NextResponse.json({ error: 'Invalid condition' }, { status: 400 });
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify order belongs to user and contains the product
    const order = await Order.findOne({
      _id: new ObjectId(orderId),
      userId: user._id,
      'items.productId': new ObjectId(productId),
    });

    if (!order) {
      return NextResponse.json({ 
        error: 'Order not found or does not contain this product' 
      }, { status: 404 });
    }

    // Check order status - must be shipped or delivered
    if (order.status !== 'shipped' && order.status !== 'delivered') {
      return NextResponse.json({ 
        error: 'Buyback is only available for shipped or delivered orders' 
      }, { status: 400 });
    }

    // For delivered orders, check if order is old enough (at least 7 days)
    if (order.status === 'delivered') {
      const orderAge = Date.now() - new Date(order.createdAt).getTime();
      const minAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      if (orderAge < minAge) {
        return NextResponse.json({ 
          error: 'Order must be at least 7 days old for buyback on delivered items' 
        }, { status: 400 });
      }
    }

    // Check if the specific item is buyback eligible
    const orderItem = order.items.find((item: any) => 
      item.productId.toString() === productId
    );

    if (!orderItem) {
      return NextResponse.json({ 
        error: 'Product not found in order' 
      }, { status: 404 });
    }

    if (!orderItem.buybackEligible) {
      return NextResponse.json({ 
        error: 'This product is not eligible for buyback' 
      }, { status: 400 });
    }

    if (orderItem.buybackRequested) {
      return NextResponse.json({ 
        error: 'Buyback already requested for this item' 
      }, { status: 400 });
    }

    // Check if buyback already exists for this product in this order
    const existingBuyback = await Buyback.findOne({
      orderId: new ObjectId(orderId),
      productId: new ObjectId(productId),
      userId: user._id,
      status: { $nin: ['cancelled', 'rejected'] },
    });

    if (existingBuyback) {
      return NextResponse.json({ 
        error: 'Buyback request already exists for this product' 
      }, { status: 400 });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Create buyback request
    const buyback = await Buyback.create({
      orderId: new ObjectId(orderId),
      userId: user._id,
      productId: new ObjectId(productId),
      requestedAmount,
      reason,
      condition,
      images: images || [],
      status: 'pending',
    });

    // Mark item as buyback requested in the order
    await Order.updateOne(
      {
        _id: new ObjectId(orderId),
        'items.productId': new ObjectId(productId),
      },
      {
        $set: {
          'items.$.buybackRequested': true,
          'items.$.buybackRequestedAt': new Date(),
        },
      }
    );

    // Send email to user
    try {
      await resend.emails.send({
        from: 'Jumia Kenya <noreply@updates.loopnet.tech>',
        to: session.user.email,
        subject: 'Buyback Request Received - Jumia',
        react: BuybackEmail({
          userName: user.name || 'Customer',
          productName: product.title,
          requestedAmount,
          status: 'submitted',
        }),
      });
    } catch (emailError) {
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Buyback request submitted successfully',
      buyback,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
