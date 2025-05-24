import { KeyIcon } from 'lucide-react';
import { useContext } from 'react';

import { Button } from '@repo/design-system/components/ui/button';
import { toast } from '@repo/design-system/components/ui/sonner';
import { useI18n } from '@repo/localization/i18n/client';

import { useOnSuccessTransition } from '../../hooks/on-success-transition';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { getErrorMessage } from '../../lib/get-error-message';

import type { AuthClient } from '../../types/auth-client';
interface PasskeyButtonProps {
  isSubmitting?: boolean;
  setIsSubmitting?: (isSubmitting: boolean) => void;
}

export function PasskeyButton({
  isSubmitting,
  setIsSubmitting,
}: PasskeyButtonProps) {
  const t = useI18n();
  const { authClient } = useContext(AuthUIContext);
  const { onSuccess } = useOnSuccessTransition({ redirectTo: '/dashboard' });

  const signInPassKey = async () => {
    setIsSubmitting?.(true);

    try {
      const response = await (authClient as AuthClient).signIn.passkey();

      console.log(response);

      if (response?.error) {
        toast.error(getErrorMessage({ error: response.error }));

        setIsSubmitting?.(false);
      } else {
        onSuccess();
      }
    } catch (error) {
      toast(getErrorMessage({ error }));

      setIsSubmitting?.(false);
    }
  };

  return (
    <Button
      className='w-full'
      loading={isSubmitting}
      formNoValidate
      name='passkey'
      value='true'
      variant='secondary'
      onClick={signInPassKey}
    >
      <KeyIcon />
      {t('authentication.actions.signInWith', {
        provider: t('authentication.passkey'),
      })}
    </Button>
  );
}
