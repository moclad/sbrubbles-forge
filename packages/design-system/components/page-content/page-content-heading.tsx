import Link from 'next/link';
import { ReactNode } from 'react';

import { T } from '../../components/ui/typography';
import { cn } from '../../lib/utils';

export type PageHeadingProps = {
  header: string;
  subTitle?: string;
  actions?: ReactNode;
  titleHref?: string;
  titleClassName?: string;
  subTitleClassName?: string;
  isPending?: boolean;
};

export function PageContentHeading({
  header,
  subTitle,
  titleHref,
  actions,
  titleClassName,
  subTitleClassName,
  isPending,
}: Readonly<PageHeadingProps>) {
  const titleElement = (
    <T.H3
      className={cn(
        '',
        titleClassName,
        isPending ? 'text-muted-foreground' : ''
      )}
    >
      {header}
    </T.H3>
  );
  const subTitleElement = (
    <T.P className={cn('text-muted-foreground leading-6', subTitleClassName)}>
      {subTitle}
    </T.P>
  );
  const wrappedTitleElement = titleHref ? (
    <Link href={titleHref}>{titleElement}</Link>
  ) : (
    <div className='w-full max-w-4xl'>
      {titleElement}
      {subTitleElement}
    </div>
  );
  return (
    <div
      className={cn(
        'flex md:items-start md:justify-between',
        isPending ? 'pointer-events-none animate-pulse' : ''
      )}
    >
      <div className='min-w-0 flex-1'>{wrappedTitleElement}</div>
      <div>{actions}</div>
    </div>
  );
}
