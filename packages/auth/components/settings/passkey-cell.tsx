'use client';

import { FingerprintIcon } from 'lucide-react';
import { useContext, useState } from 'react';

import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import { toast } from '@repo/design-system/components/ui/sonner';
import { cn } from '@repo/design-system/lib/utils';
import { useI18n } from '@repo/localization/i18n/client';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { getErrorMessage } from '../../lib/get-error-message';

import type { SettingsCardClassNames } from './shared/settings-card';

export interface PasskeyCellProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  passkey: { id: string; createdAt: Date };
  refetch?: () => Promise<void>;
}

export function PasskeyCell({
  className,
  classNames,
  passkey,
  refetch,
}: Readonly<PasskeyCellProps>) {
  const {
    mutators: { deletePasskey },
  } = useContext(AuthUIContext);
  const t = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  const handleDeletePasskey = async () => {
    setIsLoading(true);

    try {
      await deletePasskey({ id: passkey.id });
      refetch?.();
    } catch (error) {
      setIsLoading(false);

      toast.error(getErrorMessage(error) ?? t('account.requestFailed'));
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
        size='sm'
        loading={isLoading}
        variant='outline'
        onClick={handleDeletePasskey}
      >
        <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
          {t('account.delete')}
        </span>
      </Button>
    </Card>
  );
}
