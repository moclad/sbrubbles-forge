// biome-ignore lint/performance/noNamespaceImport: Sentry SDK convention
import * as Sentry from '@sentry/nextjs';

import { keys } from './keys';

export const onRequestError = Sentry.captureRequestError;

export const initializeSentry = async () => {
  if (keys().NEXT_RUNTIME === 'nodejs' && keys().SENTRY === 'true') {
    const { initializeSentry: initServer } = await import('./server');
    console.log('Initializing Sentry for server runtime');
    initServer();
  }

  if (keys().NEXT_RUNTIME === 'edge' && keys().SENTRY === 'true') {
    const { initializeSentry: initEdge } = await import('./edge');
    console.log('Initializing Sentry for edge runtime');
    initEdge();
  }
};
