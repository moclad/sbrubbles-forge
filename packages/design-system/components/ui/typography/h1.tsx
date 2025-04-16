import { ComponentProps } from 'react';

import { cn } from '../../../lib/utils';

export function H1({ className, ...rest }: ComponentProps<'h1'>) {
  const classNames = cn('scroll-m-20 text-4xl font-extrabold  text-foreground tracking-tight lg:text-5xl', className);
  return <h1 className={classNames} {...rest}></h1>;
}
