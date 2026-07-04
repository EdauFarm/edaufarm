import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { generateOTP, getOTPExpiry, sendOTPEmail } from '@/lib/email';

/**
 * @swagger
 * /email/send-otp:
 *   post:
 *     summary: Send OTP to email
 *     description: Generate and send a one-time password for email verification or password reset
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - purpose
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               purpose:
 *                 type: string
 *                 enum: [verification, password-reset]
 *                 example: verification
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: User not found (for password reset)
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { email, purpose } = await req.json();

    if (!email || !purpose) {
      return NextResponse.json(
        { error: 'Email and purpose are required' },
        { status: 400 }
      );
    }

    if (!['verification', 'password-reset'].includes(purpose)) {
      return NextResponse.json(
        { error: 'Invalid purpose. Must be "verification" or "password-reset"' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already verified (only for verification purpose)
    if (purpose === 'verification' && user.isVerified) {
      return NextResponse.json(
        { error: 'User is already verified' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Update user with OTP based on purpose
    if (purpose === 'verification') {
      user.verificationToken = otp;
      user.verificationTokenExpiry = otpExpiry;
    } else {
      user.resetPasswordToken = otp;
      user.resetPasswordTokenExpiry = otpExpiry;
    }

    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email, user.name, otp, purpose);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'OTP sent successfully',
      expiresIn: '10 minutes',
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
