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
    <div className='m-4 mt-0 flex flex-1 flex-col gap-4 rounded-md'>
      <PageContentHeading header={header} {...props} />
      <PageContentContainer>{children}</PageContentContainer>
    </div>
  );
}
