'use client';

import { Badge } from '@repo/design-system/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { useI18n } from '@repo/localization/i18n/client';
import { useMemo } from 'react';
import type { ExpenseWithDetails } from '@/lib/expenses-actions';

type TripCostSummaryCardProps = {
  expenses: ExpenseWithDetails[];
};

type CategoryTotal = {
  amount: number;
  id: string;
  name: string;
};

const COLOR_CLASSES = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
];

const WIDTH_CLASS_BY_STEP: Record<number, string> = {
  0: 'w-0',
  5: 'w-[5%]',
  10: 'w-[10%]',
  15: 'w-[15%]',
  20: 'w-[20%]',
  25: 'w-[25%]',
  30: 'w-[30%]',
  35: 'w-[35%]',
  40: 'w-[40%]',
  45: 'w-[45%]',
  50: 'w-[50%]',
  55: 'w-[55%]',
  60: 'w-[60%]',
  65: 'w-[65%]',
  70: 'w-[70%]',
  75: 'w-[75%]',
  80: 'w-[80%]',
  85: 'w-[85%]',
  90: 'w-[90%]',
  95: 'w-[95%]',
  100: 'w-[100%]',
};

function getWidthClass(percentage: number): string {
  const rounded = Math.min(100, Math.max(0, Math.round(percentage / 5) * 5));
  return WIDTH_CLASS_BY_STEP[rounded] ?? 'w-0';
}

const amountFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

function formatAmount(amount: number): string {
  return amountFormatter.format(amount);
}

export function TripCostSummaryCard({
  expenses,
}: Readonly<TripCostSummaryCardProps>) {
  const t = useI18n();

  const totalAmount = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses]
  );

  const categoryTotals = useMemo(() => {
    const totalsByCategory = new Map<string, CategoryTotal>();

    for (const expense of expenses) {
      const existing = totalsByCategory.get(expense.category.id);
      if (existing) {
        existing.amount += expense.amount;
        continue;
      }

      totalsByCategory.set(expense.category.id, {
        amount: expense.amount,
        id: expense.category.id,
        name: expense.category.name,
      });
    }

    return [...totalsByCategory.values()].sort(
      (left, right) => right.amount - left.amount
    );
  }, [expenses]);

  const categoryDistribution = useMemo(
    () =>
      categoryTotals.map((category, index) => ({
        ...category,
        colorClass: COLOR_CLASSES[index % COLOR_CLASSES.length],
        percentage: totalAmount > 0 ? (category.amount / totalAmount) * 100 : 0,
        widthClass: getWidthClass(
          totalAmount > 0 ? (category.amount / totalAmount) * 100 : 0
        ),
      })),
    [categoryTotals, totalAmount]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('trips.expenses.summary.title')}</CardTitle>
        <p className='text-muted-foreground text-sm'>
          {t('trips.expenses.summary.subtitle')}
        </p>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='rounded-lg border bg-muted/20 p-3'>
          <p className='text-muted-foreground text-sm'>
            {t('trips.expenses.summary.totalLabel')}
          </p>
          <p className='font-semibold text-2xl'>{formatAmount(totalAmount)}</p>
        </div>

        {categoryTotals.length === 0 ? (
          <div className='rounded-lg border border-dashed py-10 text-center text-muted-foreground text-sm'>
            {t('trips.expenses.summary.empty')}
          </div>
        ) : (
          <div className='space-y-3'>
            <p className='font-medium text-sm'>
              {t('trips.expenses.summary.distributionLabel')}
            </p>

            <div className='flex h-3 w-full gap-0.5 overflow-hidden rounded-full border'>
              {categoryDistribution.map((category) => (
                <div
                  className={`${category.colorClass} ${category.widthClass} h-full`}
                  key={category.id}
                />
              ))}
            </div>

            <div>
              <p className='mb-2 font-medium text-sm'>
                {t('trips.expenses.summary.categoriesLabel')}
              </p>
              <div className='space-y-2'>
                {categoryDistribution.map((category) => (
                  <div
                    className='space-y-1 rounded-md border px-2 py-1.5'
                    key={category.id}
                  >
                    <div className='flex items-center justify-between gap-3'>
                      <Badge variant='outline'>{category.name}</Badge>
                      <div className='text-right'>
                        <p className='font-medium text-sm'>
                          {formatAmount(category.amount)}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          {category.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
                      <div
                        className={`${category.colorClass} ${category.widthClass} h-full rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
