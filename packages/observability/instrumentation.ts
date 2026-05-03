// biome-ignore lint/performance/noNamespaceImport: Sentry SDK convention
import * as Sentry from '@sentry/nextjs';

export const onRequestError = Sentry.captureRequestError;

export const initializeSentry = async () => {
  if (process.env['NEXT_RUNTIME'] === 'nodejs') {
    const { initializeSentry: initServer } = await import('./server');
    console.log('Initializing Sentry for server runtime');
    initServer();
  }

  if (process.env['NEXT_RUNTIME'] === 'edge') {
    const { initializeSentry: initEdge } = await import('./edge');
    console.log('Initializing Sentry for edge runtime');
    initEdge();
  }
};
