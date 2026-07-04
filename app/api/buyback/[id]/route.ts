import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Buyback from '@/models/Buyback';
import Wallet from '@/models/Wallet';
import User from '@/models/User';
import Product from '@/models/Product';
import { ObjectId } from 'mongodb';
import { Resend } from 'resend';
import BuybackEmail from '@/lib/email-templates/BuybackEmail';
import WalletTransactionEmail from '@/lib/email-templates/WalletTransactionEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = 'force-dynamic';

// PATCH: Approve/Reject buyback (Admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, approvedAmount, comments } = await req.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only admin can approve/reject
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

      const buyback = await Buyback.findById(id)
      .populate('userId', 'email name')
      .populate('productId', 'title');

    if (!buyback) {
      return NextResponse.json({ error: 'Buyback not found' }, { status: 404 });
    }

    // Admin approval flow (credit wallet)
    if (action === 'approve') {
      if (buyback.status !== 'pending') {
        return NextResponse.json({ 
          error: 'Buyback is not in pending state' 
        }, { status: 400 });
      }

      buyback.status = 'approved';
      buyback.approvedAmount = approvedAmount || buyback.requestedAmount;
      buyback.adminResponse = {
        approvedBy: user._id,
        approvedAt: new Date(),
        comments: comments || '',
      };

      // Credit user wallet
      let wallet = await Wallet.findOne({ userId: buyback.userId._id });
      if (!wallet) {
        wallet = await Wallet.create({
          userId: buyback.userId._id,
          balance: 0,
          transactions: [],
        });
      }

      const finalAmount = buyback.approvedAmount;
      wallet.balance += finalAmount;
      wallet.transactions.push({
        type: 'buyback_credit',
        amount: finalAmount,
        status: 'completed',
        description: `Buyback credit for ${buyback.productId.title}`,
        createdAt: new Date(),
        completedAt: new Date(),
      });
      await wallet.save();

      buyback.status = 'completed';
      buyback.creditedAt = new Date();
      await buyback.save();

      // Send success email to customer
      try {
        await resend.emails.send({
          from: 'Jumia Kenya <noreply@updates.loopnet.tech>',
          to: buyback.userId.email,
          subject: 'Buyback Completed - Wallet Credited',
          react: BuybackEmail({
            userName: buyback.userId.name || 'Customer',
            productName: buyback.productId.title,
            requestedAmount: buyback.requestedAmount,
            status: 'completed',
            approvedAmount: finalAmount,
          }),
        });

        // Also send wallet transaction email
        await resend.emails.send({
          from: 'Jumia Kenya <noreply@updates.loopnet.tech>',
          to: buyback.userId.email,
          subject: 'Wallet Credited - Buyback Payment',
          react: WalletTransactionEmail({
            userName: buyback.userId.name || 'Customer',
            type: 'credit',
            amount: finalAmount,
            newBalance: wallet.balance,
            status: 'completed',
          }),
        });
      } catch (emailError) {
      }
    }

    // Admin rejection flow
    if (action === 'reject') {
      if (buyback.status !== 'pending') {
        return NextResponse.json({ 
          error: 'Buyback is not in pending state' 
        }, { status: 400 });
      }

      buyback.status = 'rejected';
      buyback.adminResponse = {
        approvedBy: user._id,
        approvedAt: new Date(),
        comments: comments || '',
      };
      await buyback.save();

      // Send email to customer
      try {
        await resend.emails.send({
          from: 'Jumia Kenya <noreply@updates.loopnet.tech>',
          to: buyback.userId.email,
          subject: 'Buyback Request Update - Jumia',
          react: BuybackEmail({
            userName: buyback.userId.name || 'Customer',
            productName: buyback.productId.title,
            requestedAmount: buyback.requestedAmount,
            status: 'rejected',
            reason: comments,
          }),
        });
      } catch (emailError) {
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Buyback updated successfully',
      buyback,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
