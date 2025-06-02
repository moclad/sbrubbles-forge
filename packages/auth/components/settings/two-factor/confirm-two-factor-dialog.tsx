'use client';

import {} from 'lucide-react';

import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@repo/design-system/components/ui/dialog';
import { useI18n } from '@repo/localization/i18n/client';

import { TwoFactorForm } from '../../auth/two-factor-form';

interface ConfirmTwoFactorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totpURI?: string | null;
}

export function ConfirmTwoFactorDialog({
  open,
  onOpenChange,
  totpURI,
}: Readonly<ConfirmTwoFactorProps>) {
  const t = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('account.twoFactor')}</DialogTitle>
          <DialogDescription>
            {t('account.twoFactorTotpLabel')}
          </DialogDescription>
        </DialogHeader>
        <TwoFactorForm totpURI={totpURI} />

        <DialogFooter>
          <Button
            type='button'
            variant='default'
            onClick={() => onOpenChange(false)}
          >
            {t('account.continue')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
