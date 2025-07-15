'use client';

import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { cn } from '@repo/design-system/lib/utils';
import type { ReactNode } from 'react';

import type { SettingsCardClassNames } from './settings-card';

export interface SettingsCardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  isPending?: boolean;
  classNames?: SettingsCardClassNames;
  className?: string;
}

export function SettingsCardHeader({
  title,
  description,
  isPending,
  classNames,
  className,
}: Readonly<SettingsCardHeaderProps>) {
  return (
    <CardHeader className={cn(classNames?.header, className)}>
      {isPending ? (
        <>
          <Skeleton
            className={cn('my-0.5 h-5 w-1/3 md:h-5.5', classNames?.skeleton)}
          />

          {description && (
            <Skeleton
              className={cn(
                'mt-1.5 mb-0.5 h-3 w-2/3 md:h-3.5',
                classNames?.skeleton
              )}
            />
          )}
        </>
      ) : (
        <>
          <CardTitle className={cn('text-lg md:text-xl', classNames?.title)}>
            {title}
          </CardTitle>

          {description && (
            <CardDescription
              className={cn('text-xs md:text-sm', classNames?.description)}
            >
              {description}
            </CardDescription>
          )}
        </>
      )}
    </CardHeader>
  );
}
