import { Fragment } from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/design-system/components/ui/breadcrumb';
import { Separator } from '@repo/design-system/components/ui/separator';
import { SidebarTrigger } from '@repo/design-system/components/ui/sidebar';

type HeaderProps = {
  pages: string[];
  page: string;
  children?: React.ReactNode;
};

export const Header = ({ pages, page, children }: HeaderProps) => (
  <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
    <SidebarTrigger className='-ml-1' />
    <Separator orientation='vertical' className='mr-2 h-4' />
    <Breadcrumb>
      <BreadcrumbList>
        {pages.map((page, index) => (
          <Fragment key={page}>
            {index > 0 && <BreadcrumbSeparator className='hidden md:block' />}
            <BreadcrumbItem className='hidden md:block'>
              <BreadcrumbLink href='#'>{page}</BreadcrumbLink>
            </BreadcrumbItem>
          </Fragment>
        ))}
        <BreadcrumbSeparator className='hidden md:block' />
        <BreadcrumbItem>
          <BreadcrumbPage>{page}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
    {children}
  </header>
);
