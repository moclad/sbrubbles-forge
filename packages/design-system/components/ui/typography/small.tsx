import { ComponentProps } from 'react';

import { cn } from '../../../lib/utils';

export function Small({ className, ...rest }: ComponentProps<'small'>) {
  const classNames = cn('text-xs font-medium leading-none', className);
  return <small className={classNames} {...rest}></small>;
}
