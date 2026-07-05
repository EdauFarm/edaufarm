import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', emailLower)
      .maybeSingle();

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json(
          { message: 'Already subscribed', success: true },
          { status: 200 }
        );
      } else {
        // Reactivate subscription
        await supabase
          .from('newsletter_subscribers')
          .update({
            is_active: true,
            unsubscribed_at: null,
            name: name || existing.name,
            phone: phone || existing.phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      }
    } else {
      // New subscription
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: emailLower,
          name: name || null,
          phone: phone || null,
          is_active: true,
        });

      if (error) {
        console.error('Subscription error:', error);
        return NextResponse.json(
          { error: 'Failed to subscribe' },
          { status: 500 }
        );
      }
    }

    // Send welcome email (non-blocking)
    sendWelcomeEmail(emailLower, name).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    return NextResponse.json(
      { message: 'Successfully subscribed!', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
