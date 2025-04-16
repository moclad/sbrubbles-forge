import { ReactNode } from 'react';

import { PageContentContainer } from './page-content-container';
import { PageContentHeading, PageHeadingProps } from './page-content-heading';

type PageContentHeaderProps = PageHeadingProps & {
  children: ReactNode;
};

export function PageContentHeader({
  children,
  header,
  ...props
}: Readonly<PageContentHeaderProps>) {
  return (
    <div className='m-24 h-full flex-1 flex-col space-y-4 md:flex'>
      <PageContentHeading header={header} {...props} />
      <PageContentContainer>{children}</PageContentContainer>
    </div>
  );
}
