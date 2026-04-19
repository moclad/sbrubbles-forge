'use client';

import { CardContent } from '@repo/design-system/components/ui/card';
import { cn } from '@repo/design-system/lib/utils';
import { useI18n } from '@repo/localization/i18n/client';
import { useContext, useEffect, useRef } from 'react';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { socialProviders } from '../../lib/social-providers';
import { ProviderCell } from './provider-cell';
import type { SettingsCardClassNames } from './shared/settings-card';
import { SettingsCard } from './shared/settings-card';
import { SettingsCellSkeleton } from './skeletons/settings-cell-skeleton';
export type ProvidersCardProps = {
  accounts?: { accountId: string; provider: string }[] | null;
  className?: string;
  classNames?: SettingsCardClassNames;
  isPending?: boolean;
  refetch?: () => void;
  skipHook?: boolean;
};

export function ProvidersCard({ className, classNames, accounts, isPending, skipHook, refetch }: Readonly<ProvidersCardProps>) {
  const t = useI18n();
  const {
    hooks: { useListAccounts },
    providers,
    otherProviders,
  } = useContext(AuthUIContext);

  if (!skipHook) {
    const result = useListAccounts();
    accounts = result.data;
    isPending = result.isPending;
    refetch = result.refetch;
  }

  const hasRefetched = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('providerLinked') && !hasRefetched.current) {
      hasRefetched.current = true;
      refetch?.();

      // Remove the parameter from URL
      params.delete('providerLinked');
      const query = params.toString();
      const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
      window.history.replaceState(null, '', url);
    }
  }, [refetch]);

  if (!(providers && otherProviders)) {
    return null;
  }
  return (
    <SettingsCard
      className={className}
      classNames={classNames}
      description={t('account.providersDescription')}
      isPending={isPending}
      title={t('account.providers')}
    >
      <CardContent className={cn('grid gap-4', classNames?.content)}>
        {isPending ? (
          <SettingsCellSkeleton classNames={classNames} />
        ) : (
          <>
            {providers?.map((provider) => {
              const socialProvider = socialProviders.find((socialProvider) => socialProvider.provider === provider);

              if (!socialProvider) {
                return null;
              }

              return <ProviderCell accounts={accounts} classNames={classNames} key={provider} provider={socialProvider} />;
            })}

            {otherProviders?.map((provider) => (
              <ProviderCell accounts={accounts} classNames={classNames} key={provider.provider} other provider={provider} />
            ))}
          </>
        )}
      </CardContent>
    </SettingsCard>
  );
}
