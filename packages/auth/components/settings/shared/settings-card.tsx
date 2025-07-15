'use client';

import { Card } from '@repo/design-system/components/ui/card';
import { toast } from '@repo/design-system/components/ui/sonner';
import { cn } from '@repo/design-system/lib/utils';
import { useI18n } from '@repo/localization/i18n/client';
import { ReactNode, useActionState } from 'react';

import { getErrorMessage } from '../../../lib/get-error-message';
import type { UserAvatarClassNames } from '../../user-avatar';
import { SettingsCardFooter } from './settings-card-footer';
import { SettingsCardHeader } from './settings-card-header';

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
  showToast?: boolean;
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
  showToast = true,
}: Readonly<SettingsCardProps>) {
  const t = useI18n();
  const performAction = async (
    _: Record<string, unknown>,
    formData: FormData
  ) => {
    try {
      await formAction?.(formData);
      if (showToast) {
        toast.success(t('account.requestSuccess'));
      }
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
          'w-full pb-0 text-start shadow-lg',
          variant === 'destructive' && 'border-destructive/40',
          className,
          classNames?.base
        )}
      >
        <SettingsCardHeader
          classNames={classNames}
          description={description}
          isPending={isPending}
          title={title}
        />

        {children}

        <SettingsCardFooter
          actionLabel={actionLabel}
          classNames={classNames}
          disabled={disabled}
          instructions={instructions}
          isPending={isPending}
          isSubmitting={isSubmitting || externalIsSubmitting}
          optimistic={optimistic}
          variant={variant}
        />
      </Card>
    </form>
  );
}
