import { useActionState, useContext } from 'react';

import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { toast } from '@repo/design-system/components/ui/sonner';
import { cn } from '@repo/design-system/lib/utils';
import { useI18n } from '@repo/localization/i18n/client';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { getErrorMessage } from '../../lib/get-error-message';

import type { SettingsCardClassNames } from './shared/settings-card';
export interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts?: { provider: string }[] | null;
  classNames?: SettingsCardClassNames;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  accounts,
  classNames,
}: Readonly<DeleteAccountDialogProps>) {
  const {
    authClient,
    basePath,
    deleteAccountVerification,
    freshAge,
    hooks: { useSession },
    navigate,
  } = useContext(AuthUIContext);

  const t = useI18n();
  const { data: sessionData } = useSession();
  const session = sessionData?.session;

  const isFresh = session
    ? Date.now() / 1000 - session?.createdAt.getTime() / 1000 < freshAge
    : false;
  const credentialsLinked = accounts?.some(
    (acc) => acc.provider === 'credential'
  );

  const formAction = async (_: unknown, formData: FormData) => {
    const params = {} as Record<string, string>;

    if (credentialsLinked) {
      const password = formData.get('password') as string;
      params.password = password;
    } else if (!isFresh) {
      navigate(`${basePath}/sign-out`);
      return;
    }

    if (deleteAccountVerification) {
      params.callbackURL = `${basePath}/sign-out`;
    }

    const { error } = await authClient.deleteUser(params);

    if (error) {
      toast.error(getErrorMessage(error) ?? t('account.requestFailed'));
    } else if (deleteAccountVerification) {
      toast.info(t('account.deleteAccountEmail'));
    } else {
      toast.success(t('account.deleteAccountSuccess'));
      navigate(`${basePath}/sign-out`);
    }

    onOpenChange(false);
  };

  const [_, action, isSubmitting] = useActionState(formAction, null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form action={action}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle
              className={cn('text-lg md:text-xl', classNames?.title)}
            >
              {t('account.deleteAccount')}
            </DialogTitle>

            <DialogDescription
              className={cn('text-xs md:text-sm', classNames?.description)}
            >
              {isFresh
                ? t('account.deleteAccountInstructions')
                : t('account.deleteAccountNotFresh')}
            </DialogDescription>
          </DialogHeader>

          {credentialsLinked && (
            <div className='grid gap-2'>
              <Label htmlFor='password'>{t('account.password')}</Label>

              <Input
                autoComplete='current-password'
                id='password'
                name='password'
                placeholder={t('account.passwordPlaceholder')}
                required
                type='password'
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type='button'
              variant='secondary'
              onClick={() => onOpenChange(false)}
            >
              {t('account.cancel')}
            </Button>

            <Button
              className={classNames?.button}
              disabled={isSubmitting}
              loading={isSubmitting}
              variant='destructive'
            >
              <span className={cn(isSubmitting && 'opacity-0')}>
                {isFresh ? t('account.deleteAccount') : t('account.signOut')}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
