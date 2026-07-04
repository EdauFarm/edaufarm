import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';

// POST /api/admin/products/approve - Approve product
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if user is admin
    const user = await User.findById(session.user.id);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can approve products' },
        { status: 403 }
      );
    }

    const { productId, approved } = await req.json();

    if (!productId || approved === undefined) {
      return NextResponse.json(
        { error: 'Product ID and approval status are required' },
        { status: 400 }
      );
    }

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update product status
    product.active = approved;
    await product.save();

    return NextResponse.json({
      message: `Product ${approved ? 'approved' : 'rejected'} successfully`,
      product,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to approve product', message: error.message },
      { status: 500 }
    );
  }
}

// GET /api/admin/products/approve - Get pending products
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if user is admin
    const user = await User.findById(session.user.id);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can view pending products' },
        { status: 403 }
      );
    }

    // Get all inactive products
    const pendingProducts = await Product.find({
      active: false,
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      products: pendingProducts,
      count: pendingProducts.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch pending products', message: error.message },
      { status: 500 }
    );
  }
}
