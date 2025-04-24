'use client';

import { CheckIcon, CopyIcon } from 'lucide-react';
import { useState } from 'react';

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

interface BackupCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backupCodes: string[];
}

export function BackupCodesDialog({
  open,
  onOpenChange,
  backupCodes,
}: Readonly<BackupCodesDialogProps>) {
  const [copied, setCopied] = useState(false);
  const t = useI18n();
  const handleCopy = () => {
    const codeText = backupCodes.join('\n');
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('account.backupCodes')}</DialogTitle>
          <DialogDescription>
            {t('account.backupCodesDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className='grid grid-cols-2 gap-2'>
          {backupCodes.map((code, index) => (
            <div
              key={index}
              className='rounded-md bg-muted p-2 text-center font-mono text-sm'
            >
              {code}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={handleCopy}
            disabled={copied}
          >
            {copied ? (
              <>
                <CheckIcon />
                {t('account.copiedToClipboard')}
              </>
            ) : (
              <>
                <CopyIcon />
                {t('account.copyAllCodes')}
              </>
            )}
          </Button>

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
