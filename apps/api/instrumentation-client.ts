// import { initializeAnalytics } from '@repo/analytics/instrumentation-client';
import { initializeSentry } from '@repo/observability/client';

initializeSentry();

export { onRouterTransitionStart } from '@repo/observability/client';
