'use client';

import type { SocialProvider } from 'better-auth/social-providers';
import { useContext, useState } from 'react';

import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import { toast } from '@repo/design-system/components/ui/sonner';
import { cn } from '@repo/design-system/lib/utils';
import { useI18n } from '@repo/localization/i18n/client';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { getErrorMessage } from '../../lib/get-error-message';

import type { Provider } from '../../lib/social-providers';
import type { AuthClient } from '../../types/auth-client';
import type { SettingsCardClassNames } from './shared/settings-card';

export interface ProviderCellProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  accounts?: { accountId: string; provider: string }[] | null;
  isPending?: boolean;
  other?: boolean;
  provider: Provider;
  refetch?: () => void;
}

export function ProviderCell({
  className,
  classNames,
  accounts,
  other,
  provider,
  refetch,
}: Readonly<ProviderCellProps>) {
  const t = useI18n();
  const {
    authClient,
    colorIcons,
    mutators: { unlinkAccount },
    noColorIcons,
  } = useContext(AuthUIContext);

  const account = accounts?.find((acc) => acc.provider === provider.provider);
  const isLinked = !!account;

  const [isLoading, setIsLoading] = useState(false);

  const handleLink = async () => {
    setIsLoading(true);
    const callbackURL = `${window.location.pathname}?providerLinked=true`;

    if (other) {
      const { error } = await (authClient as AuthClient).oauth2.link({
        providerId: provider.provider as SocialProvider,
        callbackURL,
      });

      if (error) {
        toast.error(getErrorMessage(error) ?? t('account.requestFailed'));
      }
    } else {
      const { error } = await authClient.linkSocial({
        provider: provider.provider as SocialProvider,
        callbackURL,
      });

      if (error) {
        toast.error(getErrorMessage(error) ?? t('account.requestFailed'));
      }
    }

    setIsLoading(false);
  };

  const handleUnlink = async () => {
    setIsLoading(true);

    try {
      await unlinkAccount({
        accountId: account?.accountId,
        providerId: provider.provider,
      });

      refetch?.();
    } catch (error) {
      toast.error(getErrorMessage(error) ?? t('account.requestFailed'));

      setIsLoading(false);
    }
  };

  return (
    <Card
      className={cn(
        'flex-row items-center gap-3 px-4 py-3',
        className,
        classNames?.cell
      )}
    >
      {provider.icon &&
        (() => {
          if (colorIcons) {
            return <provider.icon className='size-4' variant='color' />;
          }
          if (noColorIcons) {
            return <provider.icon className='size-4' />;
          }
          return (
            <>
              <provider.icon className='size-4 dark:hidden' variant='color' />
              <provider.icon className='hidden size-4 dark:block' />
            </>
          );
        })()}

      <span className='text-sm'>{provider.name}</span>

      <Button
        className={cn('relative ms-auto', classNames?.button)}
        loading={isLoading}
        size='sm'
        type='button'
        variant={isLinked ? 'outline' : 'default'}
        onClick={() => {
          if (isLinked) {
            handleUnlink();
          } else {
            handleLink();
          }
        }}
      >
        <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
          {isLinked ? t('account.unlink') : t('account.link')}
        </span>
      </Button>
    </Card>
  );
}
