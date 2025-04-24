'use client';

import { FingerprintIcon, Loader2 } from 'lucide-react';
import { useContext, useState } from 'react';

import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import { cn } from '@repo/design-system/lib/utils';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { getErrorMessage } from '../../lib/get-error-message';

import type { AuthLocalization } from '../../lib/auth-localization';
import type { SettingsCardClassNames } from './shared/settings-card';

export interface PasskeyCellProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  passkey: { id: string; createdAt: Date };
  localization?: Partial<AuthLocalization>;
  refetch?: () => Promise<void>;
}

export function PasskeyCell({
  className,
  classNames,
  passkey,
  localization,
  refetch,
}: PasskeyCellProps) {
  const {
    localization: authLocalization,
    mutators: { deletePasskey },
    toast,
  } = useContext(AuthUIContext);

  localization = { ...authLocalization, ...localization };

  const [isLoading, setIsLoading] = useState(false);

  const handleDeletePasskey = async () => {
    setIsLoading(true);

    try {
      await deletePasskey({ id: passkey.id });
      refetch?.();
    } catch (error) {
      setIsLoading(false);

      toast({
        variant: 'error',
        message: getErrorMessage(error) || localization.requestFailed,
      });
    }
  };

  return (
    <Card
      className={cn('flex-row items-center p-4', className, classNames?.cell)}
    >
      <div className='flex items-center gap-3'>
        <FingerprintIcon className='size-4' />
        <span className='text-sm'>{passkey.createdAt.toLocaleString()}</span>
      </div>

      <Button
        className={cn('relative ms-auto', classNames?.button)}
        disabled={isLoading}
        size='sm'
        variant='outline'
        onClick={handleDeletePasskey}
      >
        <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
          {localization.delete}
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
