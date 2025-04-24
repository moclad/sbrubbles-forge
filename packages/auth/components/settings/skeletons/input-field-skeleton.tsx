'use client';

import { cn } from '@repo/design-system//lib/utils';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';

import type { SettingsCardClassNames } from '../shared/settings-card';

export function InputFieldSkeleton({
  classNames,
}: Readonly<{ classNames?: SettingsCardClassNames }>) {
  return (
    <div className='flex flex-col gap-2'>
      <Skeleton className={cn('h-4 w-32', classNames?.skeleton)} />
      <Skeleton className={cn('h-9 w-full', classNames?.skeleton)} />
    </div>
  );
}
