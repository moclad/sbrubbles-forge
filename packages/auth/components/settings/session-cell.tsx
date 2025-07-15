'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import { toast } from '@repo/design-system/components/ui/sonner';
import { cn } from '@repo/design-system/lib/utils';
import { useI18n } from '@repo/localization/i18n/client';
import type { Session } from 'better-auth';
import { LaptopIcon, SmartphoneIcon } from 'lucide-react';
import { useContext, useState } from 'react';
import { UAParser } from 'ua-parser-js';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { getErrorMessage } from '../../lib/get-error-message';

import type { SettingsCardClassNames } from './shared/settings-card';

export interface SessionCellProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  session: Session;
  refetch?: () => Promise<void>;
}

export function SessionCell({
  className,
  classNames,
  session,
  refetch,
}: Readonly<SessionCellProps>) {
  const t = useI18n();
  const {
    hooks: { useSession },
    mutators: { revokeSession },
    navigate,
    basePath,
  } = useContext(AuthUIContext);

  const { data: sessionData } = useSession();
  const isCurrentSession = session.id === sessionData?.session?.id;

  const [isLoading, setIsLoading] = useState(false);

  const handleRevoke = async () => {
    if (isCurrentSession) {
      navigate(`${basePath}/sign-out}`);
      return;
    }

    setIsLoading(true);

    try {
      await revokeSession({ token: session.token });
      refetch?.();
    } catch (error) {
      setIsLoading(false);

      toast.error(getErrorMessage(error) ?? t('account.requestFailed'));
    }
  };

  const parser = UAParser(session.userAgent as string);
  const isMobile = parser.device.type === 'mobile';

  return (
    <Card
      className={cn(
        'flex-row items-center gap-3 px-4 py-3',
        className,
        classNames?.cell
      )}
    >
      {isMobile ? (
        <SmartphoneIcon className='size-4' />
      ) : (
        <LaptopIcon className='size-4' />
      )}

      <div className='flex flex-col'>
        <span className='font-semibold text-sm'>
          {isCurrentSession ? t('account.currentSession') : session?.ipAddress}
        </span>

        <span className='text-muted-foreground text-xs'>
          {parser.os.name}, {parser.browser.name}
        </span>
      </div>

      <Button
        className={cn('relative ms-auto', classNames?.button)}
        loading={isLoading}
        onClick={handleRevoke}
        size='sm'
        variant='outline'
      >
        {isCurrentSession ? t('account.signOut') : t('account.revoke')}
      </Button>
    </Card>
  );
}
