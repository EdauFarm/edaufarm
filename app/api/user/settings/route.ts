import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const User = (await import('@/models/User')).default;
    const { currency } = await request.json();
    if (!currency) {
      return NextResponse.json({ error: 'Currency is required' }, { status: 400 });
    }
    // Update user currency preference
    await User.findByIdAndUpdate(session.user.id, { $set: { currency } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update currency', message: error.message }, { status: 500 });
  }
}
