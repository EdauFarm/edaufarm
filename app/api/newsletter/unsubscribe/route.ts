import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resend } from '@/lib/resend';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Edau Farm <noreicle@edaufarm.com>';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return new Response(
        `<html><body><h1>Invalid Request</h1><p>No email provided.</p></body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Update subscription status
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', emailLower);

    if (error) {
      console.error('Unsubscribe error:', error);
    }

    return new Response(
      `<!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribed - Edau Farm</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; text-align: center; }
            h1 { color: #2e7d32; }
            a { color: #2e7d32; }
          </style>
        </head>
        <body>
          <h1>🌾 Edau Farm</h1>
          <h2>You've been unsubscribed</h2>
          <p>We're sorry to see you go. You will no longer receive marketing emails from us.</p>
          <p>If this was a mistake, you can always <a href="https://edaufarm.com/contact">subscribe again</a>.</p>
          <hr>
          <p><small>© ${new Date().getFullYear()} Edau Farm. West Pokot, Kenya.</small></p>
        </body>
        </html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new Response(
      `<html><body><h1>Error</h1><p>Something went wrong. Please try again later.</p></body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    await supabase
      .from('newsletter_subscribers')
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase());

    return NextResponse.json({ success: true, message: 'Unsubscribed' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
