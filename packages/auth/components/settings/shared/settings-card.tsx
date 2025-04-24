'use client';

import { ReactNode, useActionState } from 'react';

import { Card } from '@repo/design-system/components/ui/card';
import { toast } from '@repo/design-system/components/ui/sonner';
import { cn } from '@repo/design-system/lib/utils';
import { useI18n } from '@repo/localization/i18n/client';

import { getErrorMessage } from '../../../lib/get-error-message';
import { SettingsCardFooter } from './settings-card-footer';
import { SettingsCardHeader } from './settings-card-header';

import type { UserAvatarClassNames } from '../../user-avatar';

export type SettingsCardClassNames = {
  base?: string;
  avatar?: UserAvatarClassNames;
  button?: string;
  cell?: string;
  content?: string;
  description?: string;
  footer?: string;
  header?: string;
  input?: string;
  instructions?: string;
  label?: string;
  skeleton?: string;
  title?: string;
};

export interface SettingsCardProps {
  children?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  instructions?: ReactNode;
  actionLabel?: ReactNode;
  isSubmitting?: boolean;
  disabled?: boolean;
  isPending?: boolean;
  className?: string;
  classNames?: SettingsCardClassNames;
  formAction?: (formData: FormData) => Promise<unknown> | Promise<void> | void;
  optimistic?: boolean;
  variant?: 'default' | 'destructive';
}

export function SettingsCard({
  children,
  title,
  description,
  instructions,
  actionLabel,
  isSubmitting: externalIsSubmitting,
  disabled,
  isPending,
  className,
  classNames,
  formAction,
  optimistic,
  variant = 'default',
}: Readonly<SettingsCardProps>) {
  const t = useI18n();
  const performAction = async (
    _: Record<string, unknown>,
    formData: FormData
  ) => {
    try {
      await formAction?.(formData);
    } catch (error) {
      toast.error(getErrorMessage(error) ?? t('account.requestFailed'));
    }

    return {};
  };

  const [_, internalAction, isSubmitting] = useActionState(performAction, {});

  return (
    <form action={internalAction}>
      <Card
        className={cn(
          'w-full pb-0 text-start',
          variant === 'destructive' && 'border-destructive/40',
          className,
          classNames?.base
        )}
      >
        <SettingsCardHeader
          title={title}
          description={description}
          isPending={isPending}
          classNames={classNames}
        />

        {children}

        <SettingsCardFooter
          actionLabel={actionLabel}
          disabled={disabled}
          isSubmitting={isSubmitting || externalIsSubmitting}
          isPending={isPending}
          instructions={instructions}
          classNames={classNames}
          optimistic={optimistic}
          variant={variant}
        />
      </Card>
    </form>
  );
}
