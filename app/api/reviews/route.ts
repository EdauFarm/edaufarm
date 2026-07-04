import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Order from '@/models/Order';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

// GET reviews for a product
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch reviews', message: error.message },
      { status: 500 }
    );
  }
}

// POST a new review
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to post a review' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Product ID, rating, and comment are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userEmail: session.user.email,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Check if user has purchased this product (verified buyer)
    const hasPurchased = await Order.findOne({
      userEmail: session.user.email,
      'items.productId': productId,
      status: { $in: ['processing', 'shipped', 'delivered'] },
    });

    const review = await Review.create({
      productId,
      userId: session.user.email, // Using email as userId for now
      userName: session.user.name || 'Anonymous',
      userEmail: session.user.email,
      rating,
      comment,
      verified: !!hasPurchased,
    });

    // Update product rating
    const reviews = await Review.find({ productId });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      'rating.average': averageRating,
      'rating.count': reviews.length,
    });

    return NextResponse.json(
      { message: 'Review posted successfully', review },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to post review', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE a review
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to delete a review' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user owns this review
    if (review.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }

    await Review.findByIdAndDelete(reviewId);

    // Update product rating
    const reviews = await Review.find({ productId: review.productId });
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;
    
    await Product.findByIdAndUpdate(review.productId, {
      'rating.average': averageRating,
      'rating.count': reviews.length,
    });

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete review', message: error.message },
      { status: 500 }
    );
  }
}
