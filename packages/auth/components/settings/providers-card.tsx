'use client';
import { useContext, useEffect, useRef } from 'react';

import { CardContent } from '@repo/design-system/components/ui/card';
import { cn } from '@repo/design-system/lib/utils';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { socialProviders } from '../../lib/social-providers';
import { ProviderCell } from './provider-cell';
import { SettingsCard, SettingsCardClassNames } from './shared/settings-card';
import { SettingsCellSkeleton } from './skeletons/settings-cell-skeleton';

import type { AuthLocalization } from '../../lib/auth-localization';
export interface ProvidersCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  accounts?: { accountId: string; provider: string }[] | null;
  isPending?: boolean;
  localization?: Partial<AuthLocalization>;
  skipHook?: boolean;
  refetch?: () => void;
}

export function ProvidersCard({
  className,
  classNames,
  accounts,
  isPending,
  localization,
  skipHook,
  refetch,
}: ProvidersCardProps) {
  const {
    hooks: { useListAccounts },
    localization: authLocalization,
    providers,
    otherProviders,
  } = useContext(AuthUIContext);

  localization = { ...authLocalization, ...localization };

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

  return (
    <SettingsCard
      className={className}
      classNames={classNames}
      title={localization.providers}
      description={localization.providersDescription}
      isPending={isPending}
    >
      <CardContent className={cn('grid gap-4', classNames?.content)}>
        {isPending ? (
          <SettingsCellSkeleton classNames={classNames} />
        ) : (
          <>
            {providers?.map((provider) => {
              const socialProvider = socialProviders.find(
                (socialProvider) => socialProvider.provider === provider
              );

              if (!socialProvider) return null;

              return (
                <ProviderCell
                  key={provider}
                  classNames={classNames}
                  provider={socialProvider}
                  accounts={accounts}
                />
              );
            })}

            {otherProviders?.map((provider) => (
              <ProviderCell
                key={provider.provider}
                classNames={classNames}
                provider={provider}
                accounts={accounts}
                other
              />
            ))}
          </>
        )}
      </CardContent>
    </SettingsCard>
  );
}
