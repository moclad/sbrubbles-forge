import 'server-only';

import Stripe from 'stripe';

import { keys } from './keys';

// Lazy-load stripe to avoid initialization during build time
let stripeInstance: Stripe | null = null;
const getStripe = () => {
  const key = keys().STRIPE_SECRET_KEY;
  if (!stripeInstance && key) {
    stripeInstance = new Stripe(key, {
      apiVersion: '2026-04-22.dahlia',
    });
  }
  return stripeInstance;
};

export type { Stripe } from 'stripe';
export { getStripe };
