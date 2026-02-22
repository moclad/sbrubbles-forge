import type { ComponentProps } from 'react';

import { cn } from '../../../lib/utils';

export function H3({ className, ...rest }: ComponentProps<'h3'>) {
  const classNames = cn(
    'scroll-m-20 font-semibold text-2xl tracking-tight',
    className
  );
  return <h3 className={classNames} {...rest} />;
}
