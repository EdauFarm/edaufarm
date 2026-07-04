import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Wallet from '@/models/Wallet';
import User from '@/models/User';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// GET: Get user wallet
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let wallet = await Wallet.findOne({ userId: user._id });
    
    // Create wallet if doesn't exist
    if (!wallet) {
      wallet = await Wallet.create({
        userId: user._id,
        balance: 0,
        transactions: [],
      });
    }

    return NextResponse.json({ 
      success: true, 
      wallet: {
        balance: wallet.balance,
        mpesaNumber: wallet.mpesaNumber,
        mpesaVerified: wallet.mpesaVerified,
        transactions: wallet.transactions.slice(-20).reverse(), // Last 20 transactions
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Bind M-Pesa number
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mpesaNumber } = await req.json();

    // Validate M-Pesa number format
    if (!/^254\d{9}$/.test(mpesaNumber)) {
      return NextResponse.json({ 
        error: 'Invalid M-Pesa number. Format: 254XXXXXXXXX' 
      }, { status: 400 });
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let wallet = await Wallet.findOne({ userId: user._id });
    
    if (!wallet) {
      wallet = await Wallet.create({
        userId: user._id,
        balance: 0,
        mpesaNumber,
        mpesaVerified: false,
      });
    } else {
      wallet.mpesaNumber = mpesaNumber;
      wallet.mpesaVerified = false;
      wallet.updatedAt = new Date();
      await wallet.save();
    }

    // TODO: Send STK push for verification
    // For now, auto-verify (in production, use real M-Pesa verification)
    wallet.mpesaVerified = true;
    await wallet.save();

    return NextResponse.json({ 
      success: true, 
      message: 'M-Pesa number bound successfully',
      wallet: {
        mpesaNumber: wallet.mpesaNumber,
        mpesaVerified: wallet.mpesaVerified,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
