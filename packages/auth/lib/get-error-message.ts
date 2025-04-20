import { BetterFetchError } from '@better-fetch/fetch';

import type { FetchError } from '../types/fetch-error';

export function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof BetterFetchError) {
    return error.error.message ?? error.error.statusText;
  }

  if (error instanceof Error) {
    return error.message || error.name;
  }

  const fetchError = error as FetchError;
  return fetchError?.message ?? fetchError?.statusText;
}
