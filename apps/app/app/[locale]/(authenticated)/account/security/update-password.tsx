'use client';
import { z } from 'zod';

import AutoForm, { AutoFormSubmit } from '@/components/ui/auto-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { T } from '@/components/ui/Typography';
import { verifyAndUpdatePassword } from '@/data/mutations/security';
import { useSAToastMutation } from '@/hooks/useSAToastMutation';
import { useI18n } from '@/i18n/client';

export const UpdatePassword = () => {
  const t = useI18n();

  const { mutate, isPending } = useSAToastMutation(
    async (data: PasswordUpdateSchema) => {
      return await verifyAndUpdatePassword(data.currentPassword, data.password);
    },
    {
      loadingMessage: t('account.security.password.updating'),
      successMessage: t('account.security.password.updated'),
      errorMessage: (error) => {
        if (error?.cause == 'same_password') {
          return t('account.security.password.errorSamePassword');
        }
        if (error?.cause == 'invalid_password') {
          return t('account.security.password.errorInvalidPassword');
        }
        return t('account.security.password.error', { error: error.message });
      },
    },
  );

  const passwordUpdateSchema = z
    .object({
      currentPassword: z.string().min(8),
      password: z.string().min(8),
      passwordConfirmation: z.string().min(8),
    })
    .superRefine(({ password, passwordConfirmation }, checkPassComplexity) => {
      if (password !== passwordConfirmation) {
        checkPassComplexity.addIssue({
          path: ['passwordConfirmation'],
          code: 'custom',
          message: t('account.security.confirmation.errorPasswordMatch'),
        });
      }
    });

  type PasswordUpdateSchema = z.infer<typeof passwordUpdateSchema>;

  const onSubmit = (data: PasswordUpdateSchema): void => {
    mutate(data);
  };

  return (
    <Card className='w-full max-w-xl mx-auto'>
      <CardHeader className='space-y-1'>
        <CardTitle>{t('account.security.changePassword')}</CardTitle>
        <CardDescription>{t('account.security.changePasswordDescription')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <AutoForm
            id='update-password-form'
            autoReset={true}
            formSchema={passwordUpdateSchema}
            onSubmit={onSubmit}
            fieldConfig={{
              currentPassword: {
                label: t('account.security.password.current'),
                fieldType: 'password',
                inputProps: {
                  autoComplete: 'current-password',
                },
              },
              password: {
                label: t('account.security.new.label'),
                fieldType: 'password',
                inputProps: {
                  autoComplete: 'new-password',
                },
              },
              passwordConfirmation: {
                label: t('account.security.confirmation.label'),
                fieldType: 'password',
                inputProps: {
                  autoComplete: 'new-password',
                },
              },
            }}
          >
            <div className='flex'>
              <AutoFormSubmit
                disabled={isPending}
                pending={isPending}
                className='flex w-full justify-center rounded-lg border border-transparent py-3 px-4 text-sm font-medium  shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2'
              >
                {isPending ? t('account.security.password.updating') : t('account.security.password.update')}
              </AutoFormSubmit>
            </div>
          </AutoForm>
        </div>
        <T.Subtle>{t('account.security.passwordRule')}</T.Subtle>
      </CardContent>
    </Card>
  );
};
