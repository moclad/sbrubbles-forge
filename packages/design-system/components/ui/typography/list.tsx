import { ComponentProps } from 'react';

import { cn } from '../../../lib/utils';

export function List({ className, ...rest }: ComponentProps<'ul'>) {
  const classNames = cn('my-6 ml-6 list-disc [&>li]:mt-2', className);
  return <ul className={classNames} {...rest}></ul>;
}

export const ListItem = ({ className, children, ...props }: React.ComponentProps<'li'>) => (
  <li className={cn('', className)} {...props}>
    {children}
  </li>
);
