import { initializeSentry } from '@repo/observability/instrumentation';

export const register = initializeSentry;

// biome-ignore lint/performance/noBarrelFile: This file serves as the main entry point for instrumentation exports, re-exporting from the main instrumentation module for simplicity.
export { onRequestError } from '@repo/observability/instrumentation';
