// src/app/(dynamic-pages)/(authenticated-pages)/(user-pages)/settings/security/UpdateEmail.tsx

'use client';
import { z } from 'zod';

import AutoForm, { AutoFormSubmit } from '@/components/ui/auto-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateEmailAction } from '@/data/mutations/security';
import { useToastMutation } from '@/hooks/useToastMutation';
import { useI18n } from '@/i18n/client';

export const UpdateEmail = ({
  initialEmail,
}: { initialEmail: string | undefined }) => {
  const t = useI18n();

  const { mutate: updateEmail, isPending } = useToastMutation(
    async (email: string) => {
      await updateEmailAction(email);
    },
    {
      loadingMessage: t('account.security.email.updating'),
      successMessage: t('account.security.email.updated'),
      errorMessage: t('account.security.email.error'),
    }
  );

  const emailUpdateSchema = z.object({
    current: z.string().nullable(),
    email: z.string().email(),
  });

  type EmailUpdateSchema = z.infer<typeof emailUpdateSchema>;

  const onSubmit = (data: EmailUpdateSchema): void => {
    updateEmail(data.email);
  };

  return (
    <Card className='mx-auto w-full max-w-xl'>
      <CardHeader className='space-y-1'>
        <CardTitle>{t('account.security.email.changeEmail')}</CardTitle>
        <CardDescription>
          {t('account.security.email.changeEmailDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <AutoForm
            id='update-email-form'
            autoReset={true}
            values={{ current: initialEmail }}
            formSchema={emailUpdateSchema}
            onSubmit={onSubmit}
            fieldConfig={{
              current: {
                label: t('account.security.email.labelCurrent'),
                inputProps: {
                  disabled: true,
                },
              },
              email: {
                label: t('account.security.email.label'),
                inputProps: {
                  type: 'email',
                },
              },
            }}
          >
            <div className='flex'>
              <AutoFormSubmit
                disabled={isPending}
                pending={isPending}
                className='flex w-full justify-center rounded-lg border border-transparent px-4 py-3 font-medium text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2'
              >
                {isPending
                  ? t('account.security.email.updating')
                  : t('account.security.email.update')}
              </AutoFormSubmit>
            </div>
          </AutoForm>
        </div>
      </CardContent>
    </Card>
  );
};
