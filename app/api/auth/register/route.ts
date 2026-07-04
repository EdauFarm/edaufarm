import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { randomBytes } from 'crypto';
import { sendEmail } from '@/lib/email';

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     description: Create a new user account with email verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *               phone:
 *                 type: string
 *                 example: '+254712345678'
 *     responses:
 *       201:
 *         description: User created successfully, OTP sent
 *       400:
 *         description: User already exists or validation error
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { name, email, phone, password } = await request.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with unverified status
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'user',
      isVerified: false,
      verificationToken,
      verificationTokenExpiry: tokenExpiry,
    });

    // Generate verification link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

    // Send verification email
    try {
      await sendEmail(
        email,
        'Verify Your Email - Gadget World',
        `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 15px 30px; background: #1f2937; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                .button:hover { background: #374151; }
                .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome to Gadget World!</h1>
                </div>
                <div class="content">
                  <h2>Hi ${name},</h2>
                  <p>Thank you for creating an account with Gadget World. We're excited to have you on board!</p>
                  <p>Please verify your email address by clicking the button below:</p>
                  <center>
                    <a href="${verificationLink}" class="button">Verify Email Address</a>
                  </center>
                  <p>Or copy and paste this link into your browser:</p>
                  <p style="background: #e5e7eb; padding: 10px; border-radius: 5px; word-break: break-all;">
                    ${verificationLink}
                  </p>
                  <p>This link will expire in 24 hours.</p>
                  <p>If you didn't create an account, please ignore this email.</p>
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Gadget World. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      );
    } catch (emailError) {
      // Don't fail registration if email fails
    }

    return NextResponse.json(
      {
        message: 'User created successfully. Please verify your email.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create user', message: error.message },
      { status: 500 }
    );
  }
}
