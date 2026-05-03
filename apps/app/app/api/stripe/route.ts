import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { parseError } from '@repo/observability/error';
import { log } from '@repo/observability/log';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env } from '@/env';

// Lazy-load stripe to avoid initialization during build time
let stripeInstance: Stripe | null = null;
const getStripe = () => {
  if (!stripeInstance && env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-04-22.dahlia',
    });
  }
  return stripeInstance;
};

const getUserFromCustomerId = async (customerId: string) => {
  const subscription = await database.query.subscription.findFirst({
    where: (subscription, { eq }) => eq(subscription.customerId, customerId),
  });

  if (subscription) {
    return subscription;
  }

  return null;
};

const handleCheckoutSessionCompleted = async (data: Stripe.Checkout.Session) => {
  if (!data.customer) {
    return;
  }

  const customerId = typeof data.customer === 'string' ? data.customer : data.customer.id;
  const user = await getUserFromCustomerId(customerId);

  if (!user) {
    return;
  }
};

const handleSubscriptionScheduleCanceled = async (data: Stripe.SubscriptionSchedule) => {
  if (!data.customer) {
    return;
  }

  const customerId = typeof data.customer === 'string' ? data.customer : data.customer.id;
  const user = await getUserFromCustomerId(customerId);

  if (!user) {
    return;
  }
};

export const POST = async (request: Request): Promise<Response> => {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Not configured', ok: false });
  }

  const session = await auth.api.getSession({
    headers: await headers(), // some endpoint might require headers
  });

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const stripe = getStripe();

    if (!stripe) {
      return NextResponse.json({ message: 'Stripe not configured', ok: false }, { status: 503 });
    }

    const body = await request.text();
    const headerPayload = await headers();
    const signature = headerPayload.get('stripe-signature');

    if (!signature) {
      throw new Error('missing stripe-signature header');
    }

    const event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      }
      case 'subscription_schedule.canceled': {
        await handleSubscriptionScheduleCanceled(event.data.object);
        break;
      }
      default: {
        log.warn(`Unhandled event type ${event.type}`);
      }
    }

    return NextResponse.json({ ok: true, result: event });
  } catch (error) {
    const message = parseError(error);

    log.error(message);

    return NextResponse.json(
      {
        message: 'something went wrong',
        ok: false,
      },
      { status: 500 }
    );
  }
};
