import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';
import { generateHTMLReceipt } from '@/lib/html-receipt';

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

    // Ensure user owns this order or is admin
    if (order.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get user details
    const user = await User.findById(order.userId).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }


    // Generate HTML receipt (works better in serverless)
    const htmlReceipt = generateHTMLReceipt(order, user);


    return new NextResponse(htmlReceipt, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to generate receipt', message: error.message },
      { status: 500 }
    );
  }
}
