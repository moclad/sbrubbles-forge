import { useSession } from '@repo//auth/client';

import { LanguageToggle } from '../language-toggle/language-toggle';
import { ModeToggle } from '../mode-toggle';
import { Separator } from '../ui/separator';
import { SidebarTrigger } from '../ui/sidebar';
import { NotificationsMenu } from './notifications-menu';
import { UserMenu } from './user-menu';

export default function Header() {
  const session = useSession();

  if (!session.data) {
    return null;
  }

  const name = session.data.user.name;
  const email = session.data.user.email;
  const image = session.data.user.image;

  return (
    <header className='flex h-16 shrink-0 items-center justify-between gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 '>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4' />
      </div>

      <div className='flex items-center gap-2 px-4'>
        <NotificationsMenu />
        <LanguageToggle />
        <ModeToggle />
        <UserMenu user={{ name, email, image }} />
      </div>
    </header>
  );
}
