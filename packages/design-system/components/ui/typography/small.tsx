import type { ComponentProps } from 'react';

import { cn } from '../../../lib/utils';

export function Small({ className, ...rest }: ComponentProps<'small'>) {
  const classNames = cn('font-medium text-xs leading-none', className);
  return <small className={classNames} {...rest} />;
}
