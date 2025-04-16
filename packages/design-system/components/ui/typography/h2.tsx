import { ComponentProps } from 'react';

import { cn } from '../../../lib/utils';

export function H2({ className, ...rest }: ComponentProps<'h2'>) {
  const classNames = cn('scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0', className);
  return <h2 className={classNames} {...rest}></h2>;
}
