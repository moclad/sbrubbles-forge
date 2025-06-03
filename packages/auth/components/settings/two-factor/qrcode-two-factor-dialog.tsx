'use client';

import { Smartphone } from 'lucide-react';
import QRCode from 'react-qr-code';

import {
  Alert,
  AlertDescription,
} from '@repo/design-system/components/ui/alert';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { useI18n } from '@repo/localization/i18n/client';

interface QrCodeTwoFactorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totpURI?: string | null;
}

export function QrCodeTwoFactorDialog({
  open,
  onOpenChange,
  totpURI,
}: Readonly<QrCodeTwoFactorProps>) {
  const t = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('account.scanQrCode')}</DialogTitle>
          <DialogDescription>
            {t('account.scanQrCodeDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2'>
          {totpURI && (
            <div className='flex items-center justify-center'>
              <QRCode className={'border shadow-xs'} value={totpURI} />
            </div>
          )}

          <Alert variant='default'>
            <Smartphone />
            <AlertDescription>{t('account.twoFactorAdvice')}</AlertDescription>
          </Alert>
        </div>
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
