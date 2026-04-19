'use client';

import { Badge } from '@repo/design-system/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { useI18n } from '@repo/localization/i18n/client';
import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { ExpenseWithDetails } from '@/lib/expenses-actions';

type TripCostSummaryCardProps = {
  expenses: ExpenseWithDetails[];
};

type CategoryTotal = {
  amount: number;
  color: string;
  id: string;
  name: string;
};

const amountFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

function formatAmount(amount: number): string {
  return amountFormatter.format(amount);
}

export function TripCostSummaryCard({ expenses }: Readonly<TripCostSummaryCardProps>) {
  const t = useI18n();

  const totalAmount = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);

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
        color: expense.category.color,
        id: expense.category.id,
        name: expense.category.name,
      });
    }

    return [...totalsByCategory.values()].sort((left, right) => right.amount - left.amount);
  }, [expenses]);

  const categoryDistribution = useMemo(
    () =>
      categoryTotals.map((category) => ({
        ...category,
        percentage: totalAmount > 0 ? (category.amount / totalAmount) * 100 : 0,
      })),
    [categoryTotals, totalAmount]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('trips.expenses.summary.title')}</CardTitle>
        <p className='text-muted-foreground text-sm'>{t('trips.expenses.summary.subtitle')}</p>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='rounded-lg border bg-muted/20 p-3'>
          <p className='text-muted-foreground text-sm'>{t('trips.expenses.summary.totalLabel')}</p>
          <p className='font-semibold text-2xl'>{formatAmount(totalAmount)}</p>
        </div>

        {categoryTotals.length === 0 ? (
          <div className='rounded-lg border border-dashed py-10 text-center text-muted-foreground text-sm'>{t('trips.expenses.summary.empty')}</div>
        ) : (
          <div className='space-y-4'>
            <ResponsiveContainer height={200} width='100%'>
              <PieChart>
                <Pie cx='50%' cy='50%' data={categoryDistribution} dataKey='amount' innerRadius={50} nameKey='name' outerRadius={90}>
                  {categoryDistribution.map((entry) => (
                    <Cell fill={entry.color} key={entry.id} stroke='transparent' />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatAmount(value)} />
              </PieChart>
            </ResponsiveContainer>

            <div className='space-y-2'>
              <p className='font-medium text-sm'>{t('trips.expenses.summary.categoriesLabel')}</p>
              <div className='space-y-2'>
                {categoryDistribution.map((category) => (
                  <div className='flex items-center justify-between gap-3 rounded-md border px-2 py-1.5' key={category.id}>
                    <div className='flex items-center gap-2'>
                      <Badge
                        className='text-foreground'
                        style={{
                          backgroundColor: category.color,
                          borderColor: category.color,
                        }}
                        variant='outline'
                      >
                        &nbsp;
                      </Badge>
                      <span className='text-sm'>{category.name}</span>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium text-sm'>{formatAmount(category.amount)}</p>
                      <p className='text-muted-foreground text-xs'>{category.percentage.toFixed(1)}%</p>
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
