import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Review from '@/models/Review';

export const dynamic = 'force-dynamic';

// Check if user can review a product (only if they have a delivered order)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ canReview: false });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userEmail: session.user.email,
    });

    if (existingReview) {
      return NextResponse.json({ 
        canReview: false,
        reason: 'Already reviewed'
      });
    }

    // Check if user has a DELIVERED order with this product
    const deliveredOrder = await Order.findOne({
      userEmail: session.user.email,
      'items.productId': productId,
      status: 'delivered', // Only delivered orders
    });

    return NextResponse.json({
      canReview: !!deliveredOrder,
      reason: deliveredOrder ? 'Has delivered order' : 'No delivered order found'
    });
  } catch (error: any) {
    return NextResponse.json(
      { canReview: false, error: error.message },
      { status: 500 }
    );
  }
}
