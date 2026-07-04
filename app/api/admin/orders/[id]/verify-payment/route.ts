import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

/**
 * @swagger
 * /admin/orders/{id}/verify-payment:
 *   post:
 *     tags: [Admin]
 *     summary: Verify M-Pesa payment (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       401:
 *         description: Unauthorized
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Update payment verification and status
    order.mpesaVerified = true;
    order.paymentStatus = 'paid';
    
    // Only update order status if it's still pending
    if (order.status === 'pending') {
      order.status = 'processing';
    }
    
    order.updatedAt = new Date();
    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
