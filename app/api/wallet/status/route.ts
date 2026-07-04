import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Wallet from '@/models/Wallet';
import { authOptions } from '@/lib/auth';
import LipiaPaymentService from '@/lib/lipia';

export const dynamic = 'force-dynamic';

/**
 * Check payment status for a wallet transaction
 * GET /api/wallet/status?transactionId=xxx&reference=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('transactionId');
    const transactionReference = searchParams.get('reference');

    if (!transactionId || !transactionReference) {
      return NextResponse.json(
        { error: 'Transaction ID and reference are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const wallet = await Wallet.findOne({ userId: session.user.id });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const transaction = wallet.transactions.id(transactionId);

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // If transaction is already completed or failed, return wallet status
    if (transaction.status !== 'pending') {
      return NextResponse.json({
        success: true,
        transaction: {
          id: transaction._id,
          status: transaction.status,
          amount: transaction.amount,
          mpesaReference: transaction.mpesaReference,
          description: transaction.description,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt,
        },
        wallet: {
          balance: wallet.balance,
        },
      });
    }

    // Check with Lipia API for latest status
    try {
      const lipiaService = new LipiaPaymentService();
      const statusResult = await lipiaService.checkPaymentStatus(transactionReference);


      // Return current status
      return NextResponse.json({
        success: true,
        transaction: {
          id: transaction._id,
          status: transaction.status,
          amount: transaction.amount,
          mpesaReference: transaction.mpesaReference,
          description: transaction.description,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt,
        },
        wallet: {
          balance: wallet.balance,
        },
        lipiaStatus: {
          status: statusResult.data.response.Status,
          resultDesc: statusResult.data.response.ResultDesc,
          mpesaReceipt: statusResult.data.response.MpesaReceiptNumber,
        },
      });

    } catch (lipiaError: any) {
      
      // Return wallet status even if Lipia check fails
      return NextResponse.json({
        success: true,
        transaction: {
          id: transaction._id,
          status: transaction.status,
          amount: transaction.amount,
          mpesaReference: transaction.mpesaReference,
          description: transaction.description,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt,
        },
        wallet: {
          balance: wallet.balance,
        },
        lipiaStatus: {
          error: 'Could not fetch latest status from payment provider',
        },
      });
    }

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check status' },
      { status: 500 }
    );
  }
}
