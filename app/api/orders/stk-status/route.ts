import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

// GET: Check STK Push payment status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 });
    }


    await dbConnect();

    const order = await Order.findById(transactionId).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify order belongs to user
    if (order.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const currentStatus = {
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      mpesaCode: order.mpesaCode,
      verified: order.mpesaVerified
    };
    
    // Only log every 5th check to reduce noise
    if (Math.random() < 0.2) {
    }

    // Determine user-friendly message
    let message = 'Payment pending';
    if (order.paymentStatus === 'completed') {
      message = 'Payment successful';
    } else if (order.paymentStatus === 'failed') {
      // Extract failure reason from notes or provide default
      message = order.notes?.replace('Payment failed: ', '') || 'Payment was cancelled or declined';
    }

    return NextResponse.json({
      status: order.paymentStatus,
      orderId: order._id.toString(),
      message: message,
      order: {
        status: order.status,
        total: order.total,
        mpesaCode: order.mpesaCode,
        notes: order.notes,
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to check payment status',
      details: error.toString()
    }, { status: 500 });
  }
}
