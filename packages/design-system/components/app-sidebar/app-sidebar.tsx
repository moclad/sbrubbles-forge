'use client';

import { useSession } from '@repo/auth/client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@repo/design-system/components/ui/sidebar';
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  MapIcon,
  PieChart,
  Settings2,
  SquareTerminal,
} from 'lucide-react';
import type { ComponentProps } from 'react';
import { NavMain } from './nav-main';
import { NavProjects } from './nav-projects';
import { NavUser } from './nav-user';
import { TeamSwitcher } from './team-switcher';

// This is sample data.
const data = {
  navMain: [
    {
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'Analytics',
          url: '#',
        },
        {
          title: 'Trips',
          url: '/trips',
        },
      ],
      title: 'Dashboard',
      url: '#',
    },
    {
      icon: Settings2,
      items: [
        {
          title: 'Categories',
          url: '/settings/categories',
        },
        {
          title: 'People',
          url: '/settings/people',
        },
      ],
      title: 'Settings',
      url: '#',
    },
  ],
  projects: [
    {
      icon: Frame,
      name: 'Design Engineering',
      url: '#',
    },
    {
      icon: PieChart,
      name: 'Sales & Marketing',
      url: '#',
    },
    {
      icon: MapIcon,
      name: 'Travel',
      url: '#',
    },
  ],
  teams: [
    {
      logo: GalleryVerticalEnd,
      name: 'Acme Inc',
      plan: 'Enterprise',
    },
    {
      logo: AudioWaveform,
      name: 'Acme Corp.',
      plan: 'Startup',
    },
    {
      logo: Command,
      name: 'Evil Corp.',
      plan: 'Free',
    },
  ],
  user: {
    avatar: '/avatars/shadcn.jpg',
    email: 'm@example.com',
    name: 'shadcn',
  },
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const session = useSession();

  if (!session.data) {
    return null;
  }

  const name = session.data.user.name;
  const email = session.data.user.email;
  const image = session.data.user.image;

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ email, image, name }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
