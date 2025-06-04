'use client';
import { FormEvent, useContext, useState } from 'react';

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
        password,
        fetchOptions: { throw: true },
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
        password,
        fetchOptions: { throw: true },
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
      <Dialog open={open} onOpenChange={onOpenChange}>
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
                id='password'
                name='password'
                placeholder={t('account.passwordPlaceholder')}
                autoComplete='current-password'
                required
              />
            </div>

            <DialogFooter className='mt-4'>
              <Button
                type='button'
                variant='secondary'
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t('account.cancel')}
              </Button>

              <Button type='submit' disabled={isLoading} loading={isLoading}>
                {isTwoFactorEnabled
                  ? t('account.disable')
                  : t('account.enable')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BackupCodesDialog
        open={showBackupCodesDialog}
        onOpenChange={(open) => {
          setShowBackupCodesDialog(open);

          if (!open) {
            setShowConfirm2FADialog(true);
          }
        }}
        backupCodes={backupCodes}
      />

      <QrCodeTwoFactorDialog
        totpURI={totpURI}
        open={showConfirm2FADialog}
        onOpenChange={(open) => {
          setShowConfirm2FADialog(open);
        }}
      />
    </>
  );
}
