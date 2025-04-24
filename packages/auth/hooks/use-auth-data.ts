import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { toast } from '@repo/design-system/components/ui/sonner';
import { useI18n } from '@repo/localization/i18n/client';

import { AuthUIContext } from '../lib/auth-ui-provider';
import { getErrorMessage } from '../lib/get-error-message';

import type { FetchError } from '../types/fetch-error';
export function useAuthData<T>({
  queryFn,
}: {
  queryFn: () => Promise<{ data: T | null; error?: FetchError | null }>;
}) {
  const t = useI18n();
  const { authClient } = useContext(AuthUIContext);

  const { data: sessionData, isPending: sessionPending } =
    authClient.useSession();

  const [data, setData] = useState<T | null>(null);
  const [isPending, setIsPending] = useState(true);
  const initialized = useRef(false);

  const refetch = useCallback(async () => {
    const { data, error } = await queryFn();

    if (error) {
      toast.error(getErrorMessage(error) ?? t('account.requestFailed'));
    }

    setData(data);
    setIsPending(false);
  }, [queryFn, t]);

  useEffect(() => {
    if (!sessionData) {
      setIsPending(sessionPending);
      setData(null);
      initialized.current = false;
      return;
    }

    if (initialized.current) {
      return;
    }

    initialized.current = true;
    refetch();
  }, [refetch, sessionData, sessionPending]);

  return {
    data,
    isPending,
    refetch,
  };
}
