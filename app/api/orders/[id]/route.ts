import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Ensure user owns this order
    if (order.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Enrich order items with buyback eligibility from products if missing
    if (order.items && order.items.length > 0) {
      const productIds = order.items.map((item: any) => item.productId);
      const products = await Product.find({ _id: { $in: productIds } }).lean();
      
      const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));
      
      order.items = order.items.map((item: any) => {
        // If buybackEligible is not set, populate from product's buybackEnabled
        if (item.buybackEligible === undefined) {
          const product = productMap.get(item.productId.toString());
          if (product) {
            item.buybackEligible = product.buybackEnabled || false;
          }
        }
        return item;
      });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch order', message: error.message },
      { status: 500 }
    );
  }
}
