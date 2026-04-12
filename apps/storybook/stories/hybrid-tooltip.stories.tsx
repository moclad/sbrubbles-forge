import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
  TouchProvider,
} from '@repo/design-system/components/ui/touch-provider';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { Plus } from 'lucide-react';

/**
 * A popup that displays information related to an element when the element
 * receives keyboard focus, the mouse hovers over it or touch display is in use.
 */
const meta: Meta<typeof HybridTooltipContent> = {
  args: {
    children: 'Hybrid tooltip',
    side: 'top',
  },
  argTypes: {
    children: {
      control: 'text',
    },
    side: {
      control: {
        type: 'radio',
      },
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
  component: HybridTooltipContent,
  parameters: {
    layout: 'centered',
  },
  render: (args) => (
    <TouchProvider>
      <HybridTooltip>
        <HybridTooltipTrigger>
          <Plus className='size-4' />
          <span className='sr-only'>Add</span>
        </HybridTooltipTrigger>
        <HybridTooltipContent {...args} />
      </HybridTooltip>
    </TouchProvider>
  ),
  tags: ['autodocs'],
  title: 'ui/Hybrid-Tooltip',
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
