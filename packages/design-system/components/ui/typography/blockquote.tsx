import { ComponentProps } from 'react';

import { cn } from '../../../lib/utils';

export function Blockquote({ className, ...rest }: ComponentProps<'blockquote'>) {
  const classNames = cn('mt-6 border-l-2 pl-6 italic', className);
  return <blockquote className={classNames} {...rest}></blockquote>;
}
