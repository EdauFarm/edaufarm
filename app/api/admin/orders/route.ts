import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     tags: [Admin]
 *     summary: Get all orders (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by order status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate({
        path: 'userId',
        select: 'name email',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'items.productId',
        select: 'title images buybackEnabled',
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Enrich items with buyback eligibility if missing
    for (const order of orders) {
      if (order.items && order.items.length > 0) {
        order.items = order.items.map((item: any) => {
          // If buybackEligible is not set, populate from product's buybackEnabled
          if (item.buybackEligible === undefined && item.productId?.buybackEnabled !== undefined) {
            item.buybackEligible = item.productId.buybackEnabled;
          }
          return item;
        });
      }
    }

    const total = await Order.countDocuments(query);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
