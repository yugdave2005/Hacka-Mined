// BurnSight Stripe: Webhook Handler
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeKey || !webhookSecret) {
      return NextResponse.json(
        { error: 'Stripe webhook not configured' },
        { status: 503 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey);

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle subscription events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        console.log(`Checkout completed for user: ${userId}, subscription: ${subscriptionId}`);

        // In production: update user's subscription in Prisma
        // await prisma.subscription.upsert({
        //   where: { userId },
        //   update: { stripeSubscriptionId: subscriptionId, plan: 'PRO', status: 'ACTIVE' },
        //   create: { userId, stripeSubscriptionId: subscriptionId, plan: 'PRO', status: 'ACTIVE' },
        // });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}`);

        // In production: update subscription status
        // const status = subscription.status === 'active' ? 'ACTIVE' :
        //                subscription.status === 'past_due' ? 'PAST_DUE' :
        //                subscription.status === 'canceled' ? 'CANCELED' : 'INCOMPLETE';
        // await prisma.subscription.update({
        //   where: { stripeSubscriptionId: subscription.id },
        //   data: { status, currentPeriodEnd: new Date(subscription.current_period_end * 1000) },
        // });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log(`Subscription canceled: ${subscription.id}`);

        // In production: downgrade to FREE
        // await prisma.subscription.update({
        //   where: { stripeSubscriptionId: subscription.id },
        //   data: { plan: 'FREE', status: 'CANCELED' },
        // });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log(`Payment failed for invoice: ${invoice.id}`);

        // In production: mark as PAST_DUE and notify user
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
