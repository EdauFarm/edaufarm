import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { isAdmin } from '@/lib/roleCheck';

/**
 * Auto-set products as inactive based on:
 * 1. Products in pending orders (reserved items)
 * 2. Products that are out of stock (stock <= 0)
 * 3. Products in delivered orders where stock is now 0
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdmin(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    let updated = 0;
    let details = {
      outOfStock: 0,
      pendingOrders: 0,
      deliveredOutOfStock: 0,
    };

    // 1. Get all products that are currently active
    const activeProducts = await Product.find({ active: true });

    for (const product of activeProducts) {
      let shouldDeactivate = false;
      let reason = '';

      // Check if product is out of stock
      if (product.stock <= 0) {
        shouldDeactivate = true;
        reason = 'out of stock';
        details.outOfStock++;
      }

      // Check if product is in pending orders (items reserved but not yet processed)
      const pendingOrders = await Order.find({
        status: { $in: ['pending', 'pending-payment'] },
        'items.productId': product._id,
      });

      if (pendingOrders.length > 0 && product.stock <= 0) {
        shouldDeactivate = true;
        reason = 'pending orders with no stock';
        details.pendingOrders++;
      }

      // Check if product has been delivered and is now out of stock
      const deliveredOrders = await Order.find({
        status: 'delivered',
        'items.productId': product._id,
      });

      if (deliveredOrders.length > 0 && product.stock <= 0) {
        shouldDeactivate = true;
        reason = 'delivered and out of stock';
        details.deliveredOutOfStock++;
      }

      if (shouldDeactivate) {
        product.active = false;
        await product.save();
        updated++;
      }
    }

    // Also reactivate products that now have stock and no blocking conditions
    const inactiveProducts = await Product.find({ active: false });
    let reactivated = 0;

    for (const product of inactiveProducts) {
      if (product.stock > 0) {
        // Check if there are no pending orders blocking it
        const pendingOrders = await Order.find({
          status: { $in: ['pending', 'pending-payment'] },
          'items.productId': product._id,
        });

        if (pendingOrders.length === 0) {
          product.active = true;
          await product.save();
          reactivated++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Product visibility updated successfully`,
      updated,
      reactivated,
      details,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update product visibility' },
      { status: 500 }
    );
  }
}

/**
 * Get status of products that should be inactive
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdmin(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find products that should be inactive
    const outOfStock = await Product.find({ active: true, stock: { $lte: 0 } }).select('title stock');
    
    const pendingOrderProducts = await Order.aggregate([
      { $match: { status: { $in: ['pending', 'pending-payment'] } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', count: { $sum: 1 } } },
    ]);

    const deliveredOutOfStock = await Product.find({ 
      active: true, 
      stock: { $lte: 0 } 
    }).select('title stock');

    // Get products in delivered orders with no stock
    const deliveredOrderProducts = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', count: { $sum: 1 } } },
    ]);

    const deliveredProductIds = deliveredOrderProducts.map(p => p._id);
    const deliveredAndOutOfStock = await Product.find({
      _id: { $in: deliveredProductIds },
      active: true,
      stock: { $lte: 0 },
    }).select('title stock');

    return NextResponse.json({
      analysis: {
        outOfStock: outOfStock.length,
        withPendingOrders: pendingOrderProducts.length,
        deliveredAndOutOfStock: deliveredAndOutOfStock.length,
      },
      products: {
        outOfStock,
        deliveredAndOutOfStock,
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to analyze products' },
      { status: 500 }
    );
  }
}
