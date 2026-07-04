import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Wallet from '@/models/Wallet';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

// GET: Get all pending withdrawals (Admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Find all wallets with pending withdrawal transactions
    const wallets = await Wallet.find({
      'transactions.type': 'withdrawal',
      'transactions.status': 'pending'
    }).populate('userId', 'name email');

    const pendingWithdrawals = [];

    for (const wallet of wallets) {
      for (const transaction of wallet.transactions) {
        if (transaction.type === 'withdrawal' && transaction.status === 'pending') {
          pendingWithdrawals.push({
            _id: transaction._id,
            walletId: wallet._id,
            user: wallet.userId,
            amount: transaction.amount,
            mpesaNumber: wallet.mpesaNumber,
            mpesaReference: transaction.mpesaReference,
            description: transaction.description,
            createdAt: transaction.createdAt,
          });
        }
      }
    }

    // Sort by creation date (newest first)
    pendingWithdrawals.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      withdrawals: pendingWithdrawals,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
