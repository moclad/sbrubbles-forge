'use client';

import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { Label } from '@repo/design-system/components/ui/label';
import { PasswordInput } from '@repo/design-system/components/ui/password-input';
import { toast } from '@repo/design-system/components/ui/sonner';
import { useI18n } from '@repo/localization/i18n/client';
import { FormEvent, useContext, useState } from 'react';

import { authClient } from '../../../client';
import { AuthUIContext } from '../../../lib/auth-ui-provider';
import { getErrorMessage } from '../../../lib/get-error-message';
import { BackupCodesDialog } from './backup-codes-dialog';
import { QrCodeTwoFactorDialog } from './qrcode-two-factor-dialog';

interface TwoFactorPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isTwoFactorEnabled: boolean;
}

export function TwoFactorPasswordDialog({
  open,
  onOpenChange,
  isTwoFactorEnabled,
}: Readonly<TwoFactorPasswordDialogProps>) {
  const { navigate, twoFactor } = useContext(AuthUIContext);
  const t = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [showConfirm2FADialog, setShowConfirm2FADialog] = useState(false);

  async function handleEnableTwoFactor(formData: FormData) {
    const password = formData.get('password') as string;

    setIsLoading(true);

    try {
      const data = await authClient.twoFactor.enable({
        fetchOptions: { throw: true },
        password,
      });

      onOpenChange(false);
      setBackupCodes(data.backupCodes);

      if (twoFactor?.includes('totp')) {
        setTotpURI(data.totpURI);
      }

      setTimeout(() => {
        setShowBackupCodesDialog(true);
      }, 250);
    } catch (error) {
      toast.error(getErrorMessage(error) ?? t('account.requestFailed'));
    }

    setIsLoading(false);
  }

  async function handleDisableTwoFactor(formData: FormData) {
    const password = formData.get('password') as string;

    setIsLoading(true);

    try {
      await authClient.twoFactor.disable({
        fetchOptions: { throw: true },
        password,
      });

      toast.success(t('account.twoFactorDisabled'));

      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error) ?? t('account.requestFailed'));
    }

    setIsLoading(false);
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (isTwoFactorEnabled) {
      handleDisableTwoFactor(formData);
    } else {
      handleEnableTwoFactor(formData);
    }
  };

  return (
    <>
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('account.twoFactor')}</DialogTitle>
            <DialogDescription>
              {isTwoFactorEnabled
                ? t('account.twoFactorDisableInstructions')
                : t('account.twoFactorEnableInstructions')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className='grid gap-2'>
              <Label htmlFor='password'>{t('account.password')}</Label>
              <PasswordInput
                autoComplete='current-password'
                id='password'
                name='password'
                placeholder={t('account.passwordPlaceholder')}
                required
              />
            </div>

            <DialogFooter className='mt-4'>
              <Button
                disabled={isLoading}
                onClick={() => onOpenChange(false)}
                type='button'
                variant='secondary'
              >
                {t('account.cancel')}
              </Button>

              <Button disabled={isLoading} loading={isLoading} type='submit'>
                {isTwoFactorEnabled
                  ? t('account.disable')
                  : t('account.enable')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BackupCodesDialog
        backupCodes={backupCodes}
        onOpenChange={(open) => {
          setShowBackupCodesDialog(open);

          if (!open) {
            setShowConfirm2FADialog(true);
          }
        }}
        open={showBackupCodesDialog}
      />

      <QrCodeTwoFactorDialog
        onOpenChange={(open) => {
          setShowConfirm2FADialog(open);
        }}
        open={showConfirm2FADialog}
        totpURI={totpURI}
      />
    </>
  );
}
