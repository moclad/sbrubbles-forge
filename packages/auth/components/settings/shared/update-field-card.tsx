'use client';

import { ReactNode, useContext, useState } from 'react';

import { CardContent } from '@repo/design-system/components/ui/card';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import { Input } from '@repo/design-system/components/ui/input';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { cn } from '@repo/design-system/lib/utils';

import { useI18n } from '../../../../localization/i18n/client';
import { AuthUIContext } from '../../../lib/auth-ui-provider';
import { SettingsCard, SettingsCardClassNames } from './settings-card';

import type { FieldType } from '../../../types/additional-fields';
export interface UpdateFieldCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  defaultValue?: unknown;
  description?: ReactNode;
  instructions?: ReactNode;
  isPending?: boolean;
  field: string;
  placeholder?: string;
  required?: boolean;
  label?: ReactNode;
  type?: FieldType;
  validate?: (value: string) => boolean | Promise<boolean>;
}

export function UpdateFieldCard({
  className,
  classNames,
  defaultValue,
  description,
  instructions,
  isPending,
  field,
  placeholder,
  required,
  label,
  type,
  validate,
}: Readonly<UpdateFieldCardProps>) {
  const {
    hooks: { useSession },
    mutators: { updateUser },
    optimistic,
  } = useContext(AuthUIContext);

  const t = useI18n();

  const { isPending: sessionPending } = useSession();
  const [disabled, setDisabled] = useState(true);

  const updateField = async (formData: FormData) => {
    const value = (formData.get(field) as string) || '';

    if (value === defaultValue) {
      return {};
    }

    if (validate && !validate(value)) {
      return {
        error: { message: `${t('account.failedToValidate')} ${field}` },
      };
    }

    setDisabled(true);

    try {
      await updateUser({
        [field]:
          type === 'number'
            ? Number.parseFloat(value)
            : type === 'boolean'
              ? value === 'on'
              : value,
      });
    } catch (error) {
      setDisabled(false);
      throw error;
    }
  };

  return (
    <SettingsCard
      className={className}
      classNames={classNames}
      description={description}
      formAction={updateField}
      instructions={instructions}
      isPending={isPending || sessionPending}
      title={label}
      actionLabel={t('account.save')}
      disabled={disabled}
      optimistic={optimistic}
    >
      <CardContent className={classNames?.content}>
        {type === 'boolean' ? (
          <div className={cn('flex items-center gap-3')}>
            <Checkbox
              defaultChecked={
                typeof defaultValue === 'boolean' ? defaultValue : false
              }
              id={field}
              name={field}
              onCheckedChange={() => setDisabled(false)}
            />
            <label htmlFor={field} className={classNames?.label}>
              {label}
            </label>
          </div>
        ) : isPending ? (
          <Skeleton className={cn('h-9 w-full', classNames?.skeleton)} />
        ) : (
          <Input
            key={`${defaultValue}`}
            className={classNames?.input}
            defaultValue={defaultValue as string}
            name={field}
            placeholder={
              placeholder ?? (typeof label === 'string' ? label : '')
            }
            required={required}
            type={type === 'number' ? 'number' : 'text'}
            onChange={(e) => setDisabled(e.target.value === defaultValue)}
          />
        )}
      </CardContent>
    </SettingsCard>
  );
}
