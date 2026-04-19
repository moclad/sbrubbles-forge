'use client';
import { LabelList, Pie, PieChart } from 'recharts';
import type { ChartConfig } from './chart';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './chart';
export const description = 'A pie chart with a label list';

const chartData = [
  { browser: 'chrome', fill: 'var(--color-chrome)', visitors: 275 },
  { browser: 'safari', fill: 'var(--color-safari)', visitors: 200 },
  { browser: 'firefox', fill: 'var(--color-firefox)', visitors: 187 },
  { browser: 'edge', fill: 'var(--color-edge)', visitors: 173 },
  { browser: 'other', fill: 'var(--color-other)', visitors: 90 },
];

const chartConfig = {
  chrome: {
    color: 'var(--chart-1)',
    label: 'Chrome',
  },
  edge: {
    color: 'var(--chart-4)',
    label: 'Edge',
  },
  firefox: {
    color: 'var(--chart-3)',
    label: 'Firefox',
  },
  other: {
    color: 'var(--chart-5)',
    label: 'Other',
  },
  safari: {
    color: 'var(--chart-2)',
    label: 'Safari',
  },
  visitors: {
    label: 'Visitors',
  },
} satisfies ChartConfig;

export function RoundedPieChart() {
  return (
    <ChartContainer
      className='mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background'
      config={chartConfig}
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel nameKey='visitors' />} />
        <Pie cornerRadius={8} data={chartData} dataKey='visitors' innerRadius={30} paddingAngle={4} radius={10}>
          <LabelList
            dataKey='visitors'
            fill='currentColor'
            fontSize={12}
            fontWeight={500}
            formatter={(value: number) => value.toString()}
            stroke='none'
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
