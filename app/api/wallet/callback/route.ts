import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Wallet from '@/models/Wallet';
import User from '@/models/User';
import { Resend } from 'resend';
import WalletTransactionEmail from '@/lib/email-templates/WalletTransactionEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = 'force-dynamic';

/**
 * Webhook callback from Lipia Online for payment status updates
 */
export async function POST(request: NextRequest) {
  try {

    const payload = await request.json();

    const { response, status } = payload;

    if (!response || !response.Metadata) {
      return new NextResponse('ok', { status: 200 });
    }

    const {
      Amount,
      ExternalReference,
      MpesaReceiptNumber,
      Phone,
      ResultCode,
      ResultDesc,
      Metadata,
      Status,
    } = response;

    const { user_id, transaction_id, user_email } = Metadata;

    if (!user_id || !transaction_id) {
      return new NextResponse('ok', { status: 200 });
    }

    await dbConnect();

    // Find wallet and transaction
    const wallet = await Wallet.findOne({ userId: user_id });

    if (!wallet) {
      return new NextResponse('ok', { status: 200 });
    }

    const transaction = wallet.transactions.id(transaction_id);

    if (!transaction) {
      return new NextResponse('ok', { status: 200 });
    }

    // Check if already processed
    if (transaction.status !== 'pending') {
      return new NextResponse('ok', { status: 200 });
    }

    if (status && Status === 'Success' && ResultCode === 0) {
      // Payment successful

      transaction.status = 'completed';
      transaction.completedAt = new Date();
      transaction.mpesaReference = MpesaReceiptNumber;
      transaction.description = `Wallet deposit completed - ${MpesaReceiptNumber}`;

      // Credit wallet balance
      wallet.balance += Amount;
      wallet.updatedAt = new Date();

      await wallet.save();


      // Send success email
      if (user_email) {
        try {
          const user = await User.findById(user_id);
          
          if (user && user.email) {
            await resend.emails.send({
              from: 'Gadget World <noreply@updates.loopnet.tech>',
              to: user.email,
              subject: '✅ Deposit Successful - Gadget World Wallet',
              react: WalletTransactionEmail({
                userName: user?.name || 'Customer',
                type: 'deposit',
                amount: Amount,
                newBalance: wallet.balance,
                mpesaReference: MpesaReceiptNumber,
                status: 'completed',
              }),
            });

          }
        } catch (emailError) {
        }
      }
    } else {
      // Payment failed

      transaction.status = 'failed';
      transaction.description = `Payment failed: ${ResultDesc}`;
      wallet.updatedAt = new Date();

      await wallet.save();


      // Send failure email
      if (user_email) {
        try {
          const user = await User.findById(user_id);
          
          if (user && user.email) {
            await resend.emails.send({
              from: 'Gadget World <noreply@updates.loopnet.tech>',
              to: user.email,
              subject: '❌ Deposit Failed - Gadget World Wallet',
              react: WalletTransactionEmail({
                userName: user?.name || 'Customer',
                type: 'deposit',
                amount: Amount,
                newBalance: wallet.balance,
                mpesaReference: MpesaReceiptNumber || 'N/A',
                status: 'failed',
              }),
            });

          }
        } catch (emailError) {
        }
      }
    }

    // Must return "ok" for acknowledgment
    return new NextResponse('ok', { status: 200 });

  } catch (error) {
    // Still return ok to prevent retries
    return new NextResponse('ok', { status: 200 });
  }
}
