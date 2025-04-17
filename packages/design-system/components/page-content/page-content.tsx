import { ReactNode } from 'react';

import { PageContentContainer } from './page-content-container';
import { PageContentHeading, PageHeadingProps } from './page-content-heading';

type PageContentProps = PageHeadingProps & {
  children?: ReactNode;
};

export function PageContent({
  children,
  header,
  ...props
}: Readonly<PageContentProps>) {
  return (
    <div className='m-4 flex flex-1 flex-col gap-4 rounded-md pt-0'>
      <PageContentHeading header={header} {...props} />
      <PageContentContainer>{children}</PageContentContainer>
    </div>
    //  <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
    //     <div className='grid auto-rows-min gap-4 md:grid-cols-3' />
    //     <div className='min-h-[100vh] flex-1 bg-muted/50 md:min-h-min' />
    //   </div>
  );
}
