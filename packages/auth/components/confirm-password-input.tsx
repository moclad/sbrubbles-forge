import type { ChangeEvent } from 'react';

import { Label } from '@repo/design-system/components/ui/label';
import { PasswordInput } from '@repo/design-system/components/ui/password-input';
import { useI18n } from '@repo/localization/i18n/client';

export type AuthInputClassNames = {
  label?: string;
  input?: string;
};

export interface ConfirmPasswordInputProps {
  className?: string;
  classNames?: AuthInputClassNames;
  required?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
}

export function ConfirmPasswordInput({
  className,
  classNames,
  required = true,
  onChange,
  autoComplete = 'new-password',
}: Readonly<ConfirmPasswordInputProps>) {
  const t = useI18n();

  return (
    <div className={className ?? 'grid gap-2'}>
      <div className='flex items-center'>
        <Label className={classNames?.label} htmlFor='confirmPassword'>
          {t('account.confirmPassword')}
        </Label>
      </div>

      <PasswordInput
        id='confirmPassword'
        name='confirmPassword'
        autoComplete={autoComplete}
        className={classNames?.input}
        placeholder={t('account.confirmPasswordPlaceholder')}
        required={required}
        onChange={onChange}
      />
    </div>
  );
}
