'use client';

import type { SocialProvider } from 'better-auth/social-providers';
import { Loader2 } from 'lucide-react';
import { useContext, useState } from 'react';

import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import { cn } from '@repo/design-system/lib/utils';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { getErrorMessage } from '../../lib/get-error-message';

import type { AuthLocalization } from '../../lib/auth-localization';
import type { Provider } from '../../lib/social-providers';
import type { AuthClient } from '../../types/auth-client';
import type { SettingsCardClassNames } from './shared/settings-card';

export interface ProviderCellProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  accounts?: { accountId: string; provider: string }[] | null;
  isPending?: boolean;
  localization?: Partial<AuthLocalization>;
  other?: boolean;
  provider: Provider;
  refetch?: () => void;
}

export function ProviderCell({
  className,
  classNames,
  accounts,
  localization,
  other,
  provider,
  refetch,
}: ProviderCellProps) {
  const {
    authClient,
    colorIcons,
    mutators: { unlinkAccount },
    localization: authLocalization,
    noColorIcons,
    toast,
  } = useContext(AuthUIContext);

  const account = accounts?.find((acc) => acc.provider === provider.provider);
  const isLinked = !!account;

  localization = { ...authLocalization, ...localization };

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
        toast({
          variant: 'error',
          message: getErrorMessage(error) || localization.requestFailed,
        });
      }
    } else {
      const { error } = await authClient.linkSocial({
        provider: provider.provider as SocialProvider,
        callbackURL,
      });

      if (error) {
        toast({
          variant: 'error',
          message: getErrorMessage(error) || localization.requestFailed,
        });
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
      toast({
        variant: 'error',
        message: getErrorMessage(error) || localization.requestFailed,
      });

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
        (colorIcons ? (
          <provider.icon className='size-4' variant='color' />
        ) : noColorIcons ? (
          <provider.icon className='size-4' />
        ) : (
          <>
            <provider.icon className='size-4 dark:hidden' variant='color' />
            <provider.icon className='hidden size-4 dark:block' />
          </>
        ))}

      <span className='text-sm'>{provider.name}</span>

      <Button
        className={cn('relative ms-auto', classNames?.button)}
        disabled={isLoading}
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
          {isLinked ? localization.unlink : localization.link}
        </span>

        {isLoading && (
          <span className='absolute'>
            <Loader2 className='animate-spin' />
          </span>
        )}
      </Button>
    </Card>
  );
}
