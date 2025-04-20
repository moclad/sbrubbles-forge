'use client';

import { Card } from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { cn } from '@repo/design-system/lib/utils';

import type { SettingsCardClassNames } from '../shared/settings-card';

export function SettingsCellSkeleton({
  classNames,
}: Readonly<{ classNames?: SettingsCardClassNames }>) {
  return (
    <Card className={cn('flex-row p-4', classNames?.cell)}>
      <div className='flex items-center gap-2'>
        <Skeleton className={cn('size-8 rounded-full', classNames?.skeleton)} />

        <div>
          <Skeleton className={cn('h-4 w-24', classNames?.skeleton)} />
          <Skeleton className={cn('mt-1 h-3 w-36', classNames?.skeleton)} />
        </div>
      </div>

      <Skeleton className={cn('ms-auto size-9', classNames?.skeleton)} />
    </Card>
  );
}
