import { ComponentProps } from 'react';

import { cn } from '../../../lib/utils';

export function Large({ className, ...rest }: ComponentProps<'div'>) {
  const classNames = cn('text-lg font-semibold text-slate-900 dark:text-slate-50', className);
  return <div className={classNames} {...rest}></div>;
}
