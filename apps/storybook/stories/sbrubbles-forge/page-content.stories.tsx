import type { Meta, StoryObj } from '@storybook/react';

import { PageContent } from '@repo/design-system/components/page-content';
import { Button } from '@repo/design-system/components/ui/button';

const meta = {
  title: 'App-Layout/PageContent',
  component: PageContent,
  tags: ['autodocs'],
  argTypes: {},
  args: {
    header: 'Page content header',
    subTitle: 'Page content subtitle',
    actions: (
      <div>
        <Button variant={'default'}>Action</Button>
      </div>
    ),
  },
  render: (args) => (
    <PageContent {...args}>
      <div>Content</div>
    </PageContent>
  ),
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PageContent>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the PageContent.
 */
export const Default: Story = {};
