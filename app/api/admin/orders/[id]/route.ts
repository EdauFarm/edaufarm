import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { updateOrderProductsVisibility } from '@/lib/productVisibility';

/**
 * @swagger
 * /admin/orders/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Update order status (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled, paid]
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export async function PATCH(
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

    const body = await req.json();
    const { status, paymentStatus } = body;

    // Find the order first to check ownership
    const order = await Order.findById(id).populate('userId', '_id name email');

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Payment approval: allow admin to set paymentStatus to 'paid' for non-stk-push orders
    if (paymentStatus === 'paid') {
      // Only allow if not already paid
      if (order.paymentStatus === 'paid') {
        return NextResponse.json(
          { success: false, message: 'Payment already approved' },
          { status: 400 }
        );
      }
      order.paymentStatus = 'paid';
      order.mpesaVerified = true;
      order.updatedAt = new Date();
      await order.save();
      return NextResponse.json({ success: true, message: 'Payment approved', order });
    }

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    // Prevent admin from approving their own orders (changing to processing, shipped, delivered)
    const isOwnOrder = order.userId?._id?.toString() === session.user.id;
    const isApprovalStatus = ['processing', 'shipped', 'delivered'].includes(status);
    
    if (isOwnOrder && isApprovalStatus && order.status === 'pending') {
      return NextResponse.json(
        { success: false, message: 'You cannot approve your own orders. Please have another admin approve this order.' },
        { status: 403 }
      );
    }

    // Validate status transitions to ensure logical flow
    const validTransitions: Record<string, string[]> = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': [], // Final state
      'cancelled': [], // Final state
    };

    const currentStatus = order.status;
    const allowedNextStatuses = validTransitions[currentStatus] || [];

    // Allow same status (for refresh) or valid transitions
    if (currentStatus !== status && !allowedNextStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid status transition from '${currentStatus}' to '${status}'. Allowed: ${allowedNextStatuses.join(', ') || 'none (final state)'}` 
        },
        { status: 400 }
      );
    }

    // Update the order status
    const updateData: any = { 
      status, 
      updatedAt: new Date() 
    };
    
    // If moving to delivered or shipped, ensure payment is marked as paid
    if ((status === 'delivered' || status === 'shipped') && order.paymentMethod === 'mpesa') {
      updateData.paymentStatus = 'paid';
      updateData.mpesaVerified = true;
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('userId', 'name email');

    // Auto-update product visibility after status change
    await updateOrderProductsVisibility(id);

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update order' },
      { status: 500 }
    );
  }
}
