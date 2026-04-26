'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Label } from '@repo/design-system/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { toast } from '@repo/design-system/components/ui/sonner';
import { useCurrentLocale } from '@repo/localization/i18n/client';
import { useState, useTransition } from 'react';
import { formatCurrency, SUPPORTED_CURRENCIES } from '@/lib/currency-utils';
import { updateCurrency } from '@/lib/user-preferences-actions';

type ConfigurationFormProps = {
  initialCurrency: string;
};

export function ConfigurationForm({ initialCurrency }: ConfigurationFormProps) {
  const locale = useCurrentLocale();
  const [currency, setCurrency] = useState(initialCurrency);
  const [isPending, startTransition] = useTransition();

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    startTransition(async () => {
      try {
        await updateCurrency(newCurrency);
        toast.success('Currency updated successfully');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update currency');
        // Revert on error
        setCurrency(initialCurrency);
      }
    });
  };

  const selectedCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === currency);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Settings</CardTitle>
        <CardDescription>Choose your preferred currency for displaying expense amounts</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='currency-select'>Currency</Label>
          <Select disabled={isPending} onValueChange={handleCurrencyChange} value={currency}>
            <SelectTrigger className='w-full max-w-xs' id='currency-select'>
              <SelectValue>
                {selectedCurrency ? (
                  <span className='flex items-center gap-2'>
                    <span className='font-medium'>{selectedCurrency.symbol}</span>
                    <span>
                      {selectedCurrency.name} ({selectedCurrency.code})
                    </span>
                  </span>
                ) : (
                  'Select currency'
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  <span className='flex items-center gap-2'>
                    <span className='font-medium'>{curr.symbol}</span>
                    <span>
                      {curr.name} ({curr.code})
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className='text-muted-foreground text-sm'>
            This affects how amounts are displayed throughout the application
          </p>
        </div>

        {/* Preview */}
        <div className='rounded-lg border bg-muted/50 p-4'>
          <h4 className='mb-2 font-medium text-sm'>Preview</h4>
          <div className='space-y-1'>
            <div className='flex items-baseline gap-2'>
              <span className='text-muted-foreground text-sm'>Small amount:</span>
              <span className='font-medium'>{formatCurrency(12.5, currency, locale)}</span>
            </div>
            <div className='flex items-baseline gap-2'>
              <span className='text-muted-foreground text-sm'>Medium amount:</span>
              <span className='font-medium'>{formatCurrency(1234.56, currency, locale)}</span>
            </div>
            <div className='flex items-baseline gap-2'>
              <span className='text-muted-foreground text-sm'>Large amount:</span>
              <span className='font-medium'>{formatCurrency(98_765.43, currency, locale)}</span>
            </div>
          </div>
        </div>

        {isPending && <p className='text-muted-foreground text-sm italic'>Updating currency preference...</p>}
      </CardContent>
    </Card>
  );
}
