import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Wallet from '@/models/Wallet';
import User from '@/models/User';
import { Resend } from 'resend';
import WalletTransactionEmail from '@/lib/email-templates/WalletTransactionEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = 'force-dynamic';

// PATCH: Approve or reject withdrawal (Admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { action, reason } = await req.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find wallet with the transaction
      const wallet = await Wallet.findOne({
        'transactions._id': id
    }).populate('userId', 'name email');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

      const transaction = wallet.transactions.id(id);

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.type !== 'withdrawal') {
      return NextResponse.json(
        { error: 'Not a withdrawal transaction' },
        { status: 400 }
      );
    }

    if (transaction.status !== 'pending') {
      return NextResponse.json(
        { error: 'Transaction already processed' },
        { status: 400 }
      );
    }

    const user = wallet.userId as any;

    if (action === 'approve') {
      // Mark as completed
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      
      await wallet.save();

      // Send success email
      try {
        await resend.emails.send({
          from: 'Gadget World <noreply@updates.loopnet.tech>',
          to: user.email,
          subject: 'Withdrawal Completed - Gadget World Wallet',
          react: WalletTransactionEmail({
            userName: user.name || 'Customer',
            type: 'withdrawal',
            amount: transaction.amount,
            newBalance: wallet.balance,
            mpesaReference: transaction.mpesaReference,
            status: 'completed',
          }),
        });
      } catch (emailError) {
      }

      return NextResponse.json({
        success: true,
        message: 'Withdrawal approved and processed successfully',
      });
    } else {
      // Reject - refund the amount
      transaction.status = 'failed';
      transaction.completedAt = new Date();
      transaction.description = `${transaction.description || 'Withdrawal'} - Rejected: ${reason || 'Admin decision'}`;
      
      // Refund to balance
      wallet.balance += transaction.amount;
      
      await wallet.save();

      // Send rejection email
      try {
        await resend.emails.send({
          from: 'Gadget World <noreply@updates.loopnet.tech>',
          to: user.email,
          subject: 'Withdrawal Declined - Gadget World Wallet',
          react: WalletTransactionEmail({
            userName: user.name || 'Customer',
            type: 'withdrawal',
            amount: transaction.amount,
            newBalance: wallet.balance,
            mpesaReference: transaction.mpesaReference,
            status: 'failed',
            reason: reason || 'Your withdrawal request was declined by admin',
          }),
        });
      } catch (emailError) {
      }

      return NextResponse.json({
        success: true,
        message: 'Withdrawal rejected and amount refunded to wallet',
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
