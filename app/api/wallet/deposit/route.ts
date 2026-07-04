import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Wallet from '@/models/Wallet';
import User from '@/models/User';
import LipiaPaymentService from '@/lib/lipia';

export const dynamic = 'force-dynamic';

// POST: Deposit from M-Pesa
export async function POST(req: NextRequest) {
  try {
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, phoneNumber } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Minimum deposit: KSh 50
    if (amount < 50) {
      return NextResponse.json({ 
        error: 'Minimum deposit amount is KSh 50' 
      }, { status: 400 });
    }

    // Maximum deposit: KSh 150,000
    if (amount > 150000) {
      return NextResponse.json({ 
        error: 'Maximum deposit amount is KSh 150,000' 
      }, { status: 400 });
    }

    // Validate and format phone number
    if (!phoneNumber) {
      return NextResponse.json({ 
        error: 'Phone number is required' 
      }, { status: 400 });
    }

    const formattedPhone = LipiaPaymentService.formatPhoneNumber(phoneNumber);
    
    if (!LipiaPaymentService.isValidKenyanPhone(formattedPhone)) {
      return NextResponse.json({ 
        error: 'Invalid Kenyan Safaricom phone number' 
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
        transactions: [],
      });
    }

    // Create pending transaction
    const externalReference = `WALLET_DEP_${Date.now()}_${user._id}`;
    
    const transaction = {
      type: 'deposit',
      amount,
      status: 'pending',
      description: `Wallet deposit from ${formattedPhone}`,
      createdAt: new Date(),
    };

    wallet.transactions.push(transaction);
    wallet.updatedAt = new Date();
    await wallet.save();

    const transactionId = wallet.transactions[wallet.transactions.length - 1]._id;


    // Initialize Lipia payment service
    let lipiaService;
    try {
      lipiaService = new LipiaPaymentService();
    } catch (initError: any) {
      throw initError;
    }

    // Get callback URL from environment variable
    const baseUrl = process.env.PAYMENT_CALLBACK_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/api/wallet/callback`;


    try {
      // Initiate STK Push
      const stkPushResult = await lipiaService.initiateSTKPush({
        phone_number: formattedPhone,
        amount: amount,
        external_reference: externalReference,
        callback_url: callbackUrl,
        metadata: {
          user_id: user._id.toString(),
          transaction_id: transactionId.toString(),
          type: 'wallet_deposit',
          user_email: user.email,
        },
      });

      if (!stkPushResult.success) {
        // Update transaction status to failed
        wallet.transactions.id(transactionId).status = 'failed';
        wallet.transactions.id(transactionId).description = `Failed: ${stkPushResult.message}`;
        await wallet.save();

        return NextResponse.json(
          { error: stkPushResult.customerMessage },
          { status: 400 }
        );
      }

      // Update transaction with payment reference
      wallet.transactions.id(transactionId).mpesaReference = stkPushResult.data.TransactionReference;
      wallet.transactions.id(transactionId).description = `Wallet deposit via M-Pesa - Awaiting confirmation`;
      await wallet.save();

      return NextResponse.json({ 
        success: true, 
        message: 'STK push sent to your phone. Please enter your M-Pesa PIN.',
        transaction: {
          transactionId: transactionId.toString(),
          transactionReference: stkPushResult.data.TransactionReference,
          amount,
          phone: formattedPhone,
          status: 'pending',
          externalReference,
        },
      });

    } catch (stkError: any) {
      
      // Update transaction status to failed
      wallet.transactions.id(transactionId).status = 'failed';
      wallet.transactions.id(transactionId).description = `Failed: ${stkError.message}`;
      await wallet.save();

      return NextResponse.json(
        { 
          error: stkError.message || 'Failed to initiate payment',
          details: stkError.toString()
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Payment service is temporarily unavailable. Please try again later.',
      details: error.toString()
    }, { status: 500 });
  }
}
