import { KeyIcon } from 'lucide-react';

import { Button } from '@repo/design-system/components/ui/button';
import { toast } from '@repo/design-system/components/ui/sonner';
import { useI18n } from '@repo/localization/i18n/client';

import { authClient } from '../../client';
import { useOnSuccessTransition } from '../../hooks/on-success-transition';
import { getErrorMessage } from '../../lib/get-error-message';

interface PasskeyButtonProps {
  isSubmitting?: boolean;
  setIsSubmitting?: (isSubmitting: boolean) => void;
}

export function PasskeyButton({
  isSubmitting,
  setIsSubmitting,
}: PasskeyButtonProps) {
  const t = useI18n();
  const { onSuccess } = useOnSuccessTransition({ redirectTo: '/dashboard' });

  const signInPassKey = async () => {
    setIsSubmitting?.(true);

    const result = await authClient.signIn.passkey({
      fetchOptions: {
        onError: (ctx) => {
          toast(getErrorMessage({ error: ctx.error }));
          setIsSubmitting?.(false);
        },
        onSuccess: () => {
          onSuccess();
          setIsSubmitting?.(false);
        },
      },
    });

    if (result?.error) {
      toast(getErrorMessage({ error: result.error }));
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
