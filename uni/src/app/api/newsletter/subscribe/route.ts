import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

/**
 * POST /api/newsletter/subscribe
 * Adds a contact to the Resend audience for the daily digest
 */
export async function POST(request: NextRequest) {
  try {
    const { email, firstName } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Newsletter service not configured' },
        { status: 500 }
      );
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!audienceId) {
      console.error('RESEND_AUDIENCE_ID not configured');
      return NextResponse.json(
        { error: 'Newsletter service not configured' },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Add contact to audience
    const { data, error } = await resend.contacts.create({
      email: email.toLowerCase().trim(),
      firstName: firstName || undefined,
      unsubscribed: false,
      audienceId,
    });

    if (error) {
      // Resend returns an error if contact already exists — treat as success
      if (error.message?.includes('already exists')) {
        return NextResponse.json({
          success: true,
          message: "You're already subscribed!",
        });
      }
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "You're in! Expect your first digest tomorrow morning.",
    });
  } catch (error: any) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
