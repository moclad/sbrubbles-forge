'use client';

import { Badge } from '@repo/design-system/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import type { ChartConfig } from '@repo/design-system/components/ui/chart';
import { ChartContainer } from '@repo/design-system/components/ui/chart';
import { useI18n } from '@repo/localization/i18n/client';
import { useMemo, useState } from 'react';
import type { PieSectorDataItem, PieSectorShapeProps } from 'recharts';
import { Pie, PieChart, Sector } from 'recharts';
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

const renderActiveShape = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
  payload,
  percent,
  value,
}: PieSectorDataItem) => {
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * (midAngle ?? 1));
  const cos = Math.cos(-RADIAN * (midAngle ?? 1));
  const sx = (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos;
  const sy = (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin;
  const mx = (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos;
  const my = (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text dy={8} fill={fill} textAnchor='middle' x={cx} y={cy}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        endAngle={endAngle}
        fill={fill}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
      />
      <Sector
        cx={cx}
        cy={cy}
        endAngle={endAngle}
        fill={fill}
        innerRadius={(outerRadius ?? 0) + 6}
        outerRadius={(outerRadius ?? 0) + 10}
        startAngle={startAngle}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} fill='none' stroke={fill} />
      <circle cx={ex} cy={ey} fill={fill} r={2} stroke='none' />
      <text
        fill={fill}
        textAnchor={textAnchor}
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
      >{`${payload.label} ${formatAmount(value)}`}</text>
      <text dy={18} fill='#999' textAnchor={textAnchor} x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey}>
        {`(Rate ${((percent ?? 1) * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

const PieShape = (props: PieSectorShapeProps) => {
  return renderActiveShape(props as PieSectorDataItem);
};

export function TripCostSummaryCard({ expenses }: Readonly<TripCostSummaryCardProps>) {
  const t = useI18n();
  const [chartConfig, setChartConfig] = useState<ChartConfig>({});

  const totalAmount = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Function should be used as dependency of useMemo, but it causes an infinite loop when added
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

    setChartConfig({
      expenses: { label: t('trips.expenses.summary.categoriesLabel') },
      ...Object.fromEntries(
        Array.from(totalsByCategory.values()).map((category) => [
          category.name,
          { color: category.color, label: category.name },
        ])
      ),
    });

    return [...totalsByCategory.values()].sort((left, right) => right.amount - left.amount);
  }, [expenses]);

  const categoryDistribution = useMemo(
    () =>
      categoryTotals.map((category) => ({
        amount: category.amount,
        color: category.color,
        fill: category.color,
        key: category.id,
        label: category.name,
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
          <div className='rounded-lg border border-dashed py-10 text-center text-muted-foreground text-sm'>
            {t('trips.expenses.summary.empty')}
          </div>
        ) : (
          <div className='space-y-4'>
            <ChartContainer config={chartConfig}>
              <PieChart>
                <Pie
                  cornerRadius={8}
                  data={categoryDistribution}
                  dataKey='amount'
                  innerRadius={30}
                  paddingAngle={4}
                  radius={10}
                  shape={PieShape}
                />
              </PieChart>
            </ChartContainer>

            <div className='space-y-2'>
              <p className='font-medium text-sm'>{t('trips.expenses.summary.categoriesLabel')}</p>
              <div className='space-y-2'>
                {categoryDistribution.map((category) => (
                  <div
                    className='flex items-center justify-between gap-3 rounded-md border px-2 py-1.5'
                    key={category.key}
                  >
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
                      <span className='text-sm'>{category.label}</span>
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
