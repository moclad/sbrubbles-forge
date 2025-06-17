import { BetterFetchError } from '@better-fetch/fetch';

import type { FetchError } from '../types/fetch-error';

export function getErrorMessage(error: unknown): string | undefined {
  if (error as BetterFetchError) {
    console.log('BetterFetchError:', error);
    return (
      (error as BetterFetchError).error.message ??
      (error as BetterFetchError).error.statusText
    );
  }

  if (error instanceof Error) {
    return error.message || error.name;
  }

  const fetchError = error as FetchError;
  return fetchError?.message ?? fetchError?.statusText;
}
