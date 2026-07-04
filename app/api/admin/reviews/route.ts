import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdmin } from '@/lib/roleCheck';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

// POST - Admin creates a review (for migrated manual reviews)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session?.user?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, userName, userEmail, rating, comment, verified } = body;

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

    const review = await Review.create({
      productId,
      userId: userEmail || 'migrated@gadgetworld.com',
      userName: userName || 'Verified Buyer',
      userEmail: userEmail || 'migrated@gadgetworld.com',
      rating,
      comment,
      verified: verified !== undefined ? verified : true,
    });

    // Update product rating
    const reviews = await Review.find({ productId });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      'rating.average': averageRating,
      'rating.count': reviews.length,
    });

    return NextResponse.json(
      { message: 'Review created successfully', review },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create review', message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Admin updates a review
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session?.user?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reviewId, userName, rating, comment, verified } = body;


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


    // Update fields
    if (userName !== undefined) review.userName = userName;
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'Rating must be between 1 and 5' },
          { status: 400 }
        );
      }
      review.rating = rating;
    }
    if (comment !== undefined) review.comment = comment;
    if (verified !== undefined) review.verified = verified;

    await review.save();

    // Update product rating
    const reviews = await Review.find({ productId: review.productId });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(review.productId, {
      'rating.average': averageRating,
      'rating.count': reviews.length,
    });


    return NextResponse.json(
      { message: 'Review updated successfully', review },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update review', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Admin deletes any review
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session?.user?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
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
