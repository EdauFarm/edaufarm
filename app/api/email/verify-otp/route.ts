import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

/**
 * @swagger
 * /email/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     description: Verify the one-time password sent to user's email
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 example: '123456'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { email, otp, purpose } = await req.json();

    if (!email || !otp || !purpose) {
      return NextResponse.json(
        { error: 'Email, OTP, and purpose are required' },
        { status: 400 }
      );
    }

    if (!['verification', 'password-reset'].includes(purpose)) {
      return NextResponse.json(
        { error: 'Invalid purpose. Must be "verification" or "password-reset"' },
        { status: 400 }
      );
    }

    // Find user and include OTP fields
    const user = await User.findOne({ email }).select(
      purpose === 'verification' 
        ? '+verificationToken +verificationTokenExpiry' 
        : '+resetPasswordToken +resetPasswordTokenExpiry'
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let storedOTP: string | undefined;
    let otpExpiry: Date | undefined;

    if (purpose === 'verification') {
      storedOTP = user.verificationToken;
      otpExpiry = user.verificationTokenExpiry;
    } else {
      storedOTP = user.resetPasswordToken;
      otpExpiry = user.resetPasswordTokenExpiry;
    }

    // Verify OTP exists
    if (!storedOTP || !otpExpiry) {
      return NextResponse.json(
        { error: 'No OTP found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > otpExpiry) {
      // Clear expired OTP
      if (purpose === 'verification') {
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
      } else {
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiry = undefined;
      }
      await user.save();

      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP matches
    if (storedOTP !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // OTP is valid - update user based on purpose
    if (purpose === 'verification') {
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpiry = undefined;
      
      await user.save();
      
      // Create wallet for the user with 0 balance
      try {
        const Wallet = (await import('@/models/Wallet')).default;
        
        // Check if wallet already exists
        const existingWallet = await Wallet.findOne({ userId: user._id });
        
        if (!existingWallet) {
          await Wallet.create({
            userId: user._id,
            balance: 0,
            transactions: [],
          });
        }
      } catch (walletError) {
        // Don't fail verification if wallet creation fails
      }
    } else {
      // For password reset, clear OTP but don't verify user
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpiry = undefined;
      await user.save();
    }

    return NextResponse.json({
      message: purpose === 'verification' ? 'Email verified successfully' : 'OTP verified successfully',
      verified: true,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
