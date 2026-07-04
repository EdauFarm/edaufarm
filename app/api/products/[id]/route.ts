import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import User from '@/models/User';

// Enable caching with 10-minute revalidation
export const revalidate = 600;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  let objectId;
  try {
    objectId = new mongoose.Types.ObjectId(id);
  } catch (e) {
    return NextResponse.json(
      { error: 'Invalid product id', message: 'ID must be a valid ObjectId' },
      { status: 400 }
    );
  }
  try {
    await dbConnect();

    const product = await Product.findById(objectId).lean();

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch product', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  let objectId;
  try {
    objectId = new mongoose.Types.ObjectId(id);
  } catch (e) {
    return NextResponse.json(
      { error: 'Invalid product id', message: 'ID must be a valid ObjectId' },
      { status: 400 }
    );
  }
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(session.user.id);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can update products' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const product = await Product.findByIdAndUpdate(
      objectId,
      body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Product updated successfully', product });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update product', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  let objectId;
  try {
    objectId = new mongoose.Types.ObjectId(id);
  } catch (e) {
    return NextResponse.json(
      { error: 'Invalid product id', message: 'ID must be a valid ObjectId' },
      { status: 400 }
    );
  }
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(session.user.id);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete products' },
        { status: 403 }
      );
    }

    const product = await Product.findByIdAndDelete(objectId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Product deleted successfully', product });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete product', message: error.message },
      { status: 500 }
    );
  }
}