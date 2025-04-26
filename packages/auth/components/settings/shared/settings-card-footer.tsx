'use client';

import { Button } from '@repo/design-system/components/ui/button';
import {
  CardDescription,
  CardFooter,
} from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { cn } from '@repo/design-system/lib/utils';

import type { ReactNode } from 'react';

import type { SettingsCardClassNames } from './settings-card';

export interface SettingsCardFooterProps {
  actionLabel?: ReactNode;
  disabled?: boolean;
  isSubmitting?: boolean;
  isPending?: boolean;
  instructions?: ReactNode;
  classNames?: SettingsCardClassNames;
  className?: string;
  optimistic?: boolean;
  variant?: 'default' | 'destructive';
}

export function SettingsCardFooter({
  actionLabel,
  disabled,
  isSubmitting,
  isPending,
  instructions,
  classNames,
  className,
  optimistic,
  variant = 'default',
}: Readonly<SettingsCardFooterProps>) {
  return (
    <CardFooter
      className={cn(
        'flex w-full justify-between gap-4 ',
        (actionLabel || instructions) && '!py-2 border-t',
        variant === 'default'
          ? 'dark:bg-transparent'
          : 'border-destructive/30 bg-destructive/10',
        className,
        classNames?.footer
      )}
    >
      {isPending ? (
        <>
          <Skeleton
            className={cn(
              'my-0.5 h-3 w-48 max-w-full md:h-4 md:w-56',
              classNames?.skeleton
            )}
          />
          {actionLabel && (
            <Skeleton
              className={cn('h-8 w-14 md:ms-auto', classNames?.skeleton)}
            />
          )}
        </>
      ) : (
        <>
          <CardDescription
            className={cn(
              'text-muted-foreground text-xs md:text-sm',
              classNames?.instructions
            )}
          >
            {instructions}
          </CardDescription>

          {actionLabel && (
            <Button
              className={cn('md:ms-auto', classNames?.button)}
              disabled={disabled || isSubmitting}
              loading={isSubmitting}
              size='sm'
              type='submit'
              variant={variant === 'destructive' ? 'destructive' : 'default'}
            >
              <span className={cn(!optimistic && isSubmitting && 'opacity-0')}>
                {actionLabel}
              </span>
            </Button>
          )}
        </>
      )}
    </CardFooter>
  );
}
