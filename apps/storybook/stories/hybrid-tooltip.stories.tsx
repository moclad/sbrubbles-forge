import { Plus } from 'lucide-react';

import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
  TouchProvider,
} from '@repo/design-system/components/ui/touch-provider';

import type { Meta, StoryObj } from '@storybook/react';
/**
 * A popup that displays information related to an element when the element
 * receives keyboard focus, the mouse hovers over it or touch display is in use.
 */
const meta: Meta<typeof HybridTooltipContent> = {
  title: 'ui/Hybrid-Tooltip',
  component: HybridTooltipContent,
  tags: ['autodocs'],
  argTypes: {
    side: {
      options: ['top', 'bottom', 'left', 'right'],
      control: {
        type: 'radio',
      },
    },
    children: {
      control: 'text',
    },
  },
  args: {
    side: 'top',
    children: 'Hybrid tooltip',
  },
  parameters: {
    layout: 'centered',
  },
  render: (args) => (
    <TouchProvider>
      <HybridTooltip>
        <HybridTooltipTrigger>
          <Plus className='h-4 w-4' />
          <span className='sr-only'>Add</span>
        </HybridTooltipTrigger>
        <HybridTooltipContent {...args} />
      </HybridTooltip>
    </TouchProvider>
  ),
} satisfies Meta<typeof HybridTooltipContent>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the tooltip.
 */
export const Default: Story = {};

/**
 * Use the `bottom` side to display the tooltip below the element.
 */
export const Bottom: Story = {
  args: {
    side: 'bottom',
  },
};

/**
 * Use the `left` side to display the tooltip to the left of the element.
 */
export const Left: Story = {
  args: {
    side: 'left',
  },
};

/**
 * Use the `right` side to display the tooltip to the right of the element.
 */
export const Right: Story = {
  args: {
    side: 'right',
  },
};
