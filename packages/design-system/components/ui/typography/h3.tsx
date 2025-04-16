import { ComponentProps } from 'react';

import { cn } from '../../../lib/utils';

export function H3({ className, ...rest }: ComponentProps<'h3'>) {
  const classNames = cn('scroll-m-20 text-2xl font-semibold tracking-tight', className);
  return <h3 className={classNames} {...rest}></h3>;
}
