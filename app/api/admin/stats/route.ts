import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get admin statistics
 *     description: Retrieve platform statistics (admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalProducts:
 *                   type: integer
 *                   example: 1250
 *                 totalUsers:
 *                   type: integer
 *                   example: 5432
 *                 totalOrders:
 *                   type: integer
 *                   example: 876
 *                 totalRevenue:
 *                   type: number
 *                   example: 4567890
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin role check
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    await dbConnect();

    const [
      totalProducts,
      totalUsers,
      totalOrders,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      recentUsers,
      orders,
      topProducts
    ] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['pending', 'processing'] } }),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'name email').lean(),
      User.find().sort({ createdAt: -1 }).limit(10).select('name email createdAt').lean(),
      Order.find().lean(),
      Product.find().sort({ sales: -1 }).limit(10).select('title price sales').lean(),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Calculate monthly revenue for the last 12 months
    const monthlyRevenue = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate < monthEnd;
      });

      const monthTotal = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      monthlyRevenue.push(Math.round(monthTotal * 100) / 100);
    }

    return NextResponse.json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      pendingOrders,
      lowStockProducts,
      recentOrders: recentOrders.map(order => ({
        _id: order._id,
        customerName: (order.userId as any)?.name || 'Unknown',
        total: order.total || 0,
        status: order.status || 'pending',
        createdAt: order.createdAt,
      })),
      recentUsers,
      monthlyRevenue,
      topProducts: topProducts.map(product => ({
        _id: product._id,
        title: product.title,
        price: product.price,
        sales: 0, // TODO: Calculate actual sales from orders
      })),
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
