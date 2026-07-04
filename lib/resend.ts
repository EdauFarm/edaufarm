import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
}

export const resend = new Resend(process.env.RESEND_API_KEY || '');

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number }>();

export function storeOTP(email: string, otp: string): void {
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email, { otp, expires });
  
  // Clean up expired OTPs
  setTimeout(() => otpStore.delete(email), 10 * 60 * 1000);
}

export function verifyOTP(email: string, otp: string): boolean {
  const stored = otpStore.get(email);
  
  if (!stored) return false;
  if (Date.now() > stored.expires) {
    otpStore.delete(email);
    return false;
  }
  
  if (stored.otp === otp) {
    otpStore.delete(email);
    return true;
  }
  
  return false;
}
