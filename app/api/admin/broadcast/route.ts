import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendBroadcastEmail, sendHarvestNotification } from '@/lib/resend';

// Admin endpoint to send marketing broadcasts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, subject, title, content, ctaText, ctaUrl, products } = body;

    // Get active subscribers
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true);

    if (error) {
      console.error('Failed to fetch subscribers:', error);
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: 'No active subscribers', sent: 0 });
    }

    const emails = subscribers.map(s => s.email);

    // Send based on type
    if (type === 'harvest' && products) {
      await sendHarvestNotification(emails, products);
    } else if (type === 'custom' || type === 'general') {
      await sendBroadcastEmail(emails, {
        subject,
        title: title || 'News from Edau Farm',
        content: content || '',
        ctaText,
        ctaUrl,
      });
    } else {
      return NextResponse.json({ error: 'Invalid broadcast type' }, { status: 400 });
    }

    // Log the broadcast (non-blocking)
    supabase.from('broadcast_logs').insert({
      type,
      subject: subject || title || 'Broadcast',
      recipients_count: emails.length,
      sent_at: new Date().toISOString(),
    }).then(({ error }) => {
      if (error) console.error('Failed to log broadcast:', error);
    });

    return NextResponse.json({
      success: true,
      message: `Broadcast sent to ${emails.length} subscribers`,
      recipients: emails.length,
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json({ error: 'Failed to send broadcast' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('is_active', true)
      .order('subscribed_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    const { count } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    return NextResponse.json({
      subscribers,
      total: count || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
