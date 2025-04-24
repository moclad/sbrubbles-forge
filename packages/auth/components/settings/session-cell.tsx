'use client';

import type { Session } from 'better-auth';
import { LaptopIcon, Loader2, SmartphoneIcon } from 'lucide-react';
import { useContext, useState } from 'react';
import { UAParser } from 'ua-parser-js';

import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import { cn } from '@repo/design-system/lib/utils';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { getErrorMessage } from '../../lib/get-error-message';

import type { AuthLocalization } from '../../lib/auth-localization';
import type { SettingsCardClassNames } from './shared/settings-card';

export interface SessionCellProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  session: Session;
  localization?: Partial<AuthLocalization>;
  refetch?: () => Promise<void>;
}

export function SessionCell({
  className,
  classNames,
  session,
  localization,
  refetch,
}: SessionCellProps) {
  const {
    hooks: { useSession },
    mutators: { revokeSession },
    localization: authLocalization,
    navigate,
    toast,
    basePath,
    viewPaths,
  } = useContext(AuthUIContext);

  localization = { ...authLocalization, ...localization };

  const { data: sessionData } = useSession();
  const isCurrentSession = session.id === sessionData?.session?.id;

  const [isLoading, setIsLoading] = useState(false);

  const handleRevoke = async () => {
    if (isCurrentSession) {
      navigate(`${basePath}/${viewPaths.signOut}`);
      return;
    }

    setIsLoading(true);

    try {
      await revokeSession({ token: session.token });
      refetch?.();
    } catch (error) {
      setIsLoading(false);

      toast({
        variant: 'error',
        message: getErrorMessage(error) || localization.requestFailed,
      });
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
          {isCurrentSession ? localization.currentSession : session?.ipAddress}
        </span>

        <span className='text-muted-foreground text-xs'>
          {parser.os.name}, {parser.browser.name}
        </span>
      </div>

      <Button
        className={cn('relative ms-auto', classNames?.button)}
        disabled={isLoading}
        size='sm'
        variant='outline'
        onClick={handleRevoke}
      >
        <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
          {isCurrentSession ? localization.signOut : localization.revoke}
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
