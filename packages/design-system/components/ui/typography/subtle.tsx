import { ComponentProps } from 'react';

import { cn } from '../../../lib/utils';

export function Subtle({ className, ...rest }: ComponentProps<'p'>) {
  const classNames = cn('text-sm text-slate-500 dark:text-slate-400', className);
  return <p className={classNames} {...rest}></p>;
}
