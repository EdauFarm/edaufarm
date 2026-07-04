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

// POST: Withdraw to M-Pesa
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Minimum withdrawal: KSh 100
    if (amount < 100) {
      return NextResponse.json({ 
        error: 'Minimum withdrawal amount is KSh 100' 
      }, { status: 400 });
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const wallet = await Wallet.findOne({ userId: user._id });
    
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    if (!wallet.mpesaNumber || !wallet.mpesaVerified) {
      return NextResponse.json({ 
        error: 'Please bind and verify your M-Pesa number first' 
      }, { status: 400 });
    }

    if (wallet.balance < amount) {
      return NextResponse.json({ 
        error: 'Insufficient balance' 
      }, { status: 400 });
    }

    // Deduct from wallet immediately
    wallet.balance -= amount;
    
    // Create transaction record as pending (awaits admin approval)
    const mpesaReference = `WD${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    wallet.transactions.push({
      type: 'withdrawal',
      amount,
      mpesaReference,
      status: 'pending',
      description: `Withdrawal request to ${wallet.mpesaNumber} - Awaiting admin approval`,
      createdAt: new Date(),
    });

    await wallet.save();

    // Send initial email
    try {
      await resend.emails.send({
        from: 'Gadget World <noreply@updates.loopnet.tech>',
        to: session.user.email,
        subject: 'Withdrawal Request Received - Gadget World Wallet',
        react: WalletTransactionEmail({
          userName: user.name || 'Customer',
          type: 'withdrawal',
          amount,
          newBalance: wallet.balance,
          mpesaReference,
          status: 'pending',
        }),
      });
    } catch (emailError) {
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Withdrawal request submitted successfully! Our team will process it within 1-24 hours.',
      transaction: {
        mpesaReference,
        amount,
        status: 'pending',
        estimatedTime: '1-24 hours',
        note: 'You will receive a confirmation email once approved',
      },
      newBalance: wallet.balance,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
