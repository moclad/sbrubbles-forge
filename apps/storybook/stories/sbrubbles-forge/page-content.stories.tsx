import { PageContent } from '@repo/design-system/components/page-content';
import { Button } from '@repo/design-system/components/ui/button';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta = {
  args: {
    actions: (
      <div>
        <Button variant={'default'}>Action</Button>
      </div>
    ),
    header: 'Page content header',
    subTitle: 'Page content subtitle',
  },
  argTypes: {},
  component: PageContent,
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => (
    <PageContent {...args}>
      <div>Content</div>
    </PageContent>
  ),
  tags: ['autodocs'],
  title: 'App-Layout/PageContent',
} satisfies Meta<typeof PageContent>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the PageContent.
 */
export const Default: Story = {};
