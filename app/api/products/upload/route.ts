import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';

// POST /api/products - Create new product (Admin only)
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
        { error: 'Only admins can create products' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      price,
      compareAtPrice,
      images,
      category,
      subcategory,
      brand,
      sku,
      stock,
      variants,
      specifications,
      tags,
      featured,
    } = body;

    // Validate required fields
    if (!title || !description || !price || !category || !sku || stock === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, price, category, sku, stock' },
        { status: 400 }
      );
    }

    // Create product
    const product = await Product.create({
      title,
      description,
      price,
      compareAtPrice,
      images: images || [],
      category,
      subcategory,
      brand,
      sku,
      stock,
      variants: variants || [],
      specifications: specifications || [],
      rating: {
        average: 0,
        count: 0,
      },
      tags: tags || [],
      featured: featured || false,
      active: true,
    });

    return NextResponse.json(
      {
        message: 'Product created successfully',
        product,
      },
      { status: 201 }
    );
  } catch (error: any) {
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create product', message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/products - Update existing product (Admin or Product Owner)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can update products' },
        { status: 403 }
      );
    }

    const { productId, ...updates } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
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

    // Update product
    Object.assign(product, updates);
    await product.save();

    return NextResponse.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update product', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/products - Delete product (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete products' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete product', message: error.message },
      { status: 500 }
    );
  }
}
