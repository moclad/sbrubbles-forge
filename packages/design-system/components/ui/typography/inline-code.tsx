import { cn } from '../../../lib/utils';

export function InlineCode({ className, children, ...props }: React.ComponentProps<'code'>) {
  return (
    <code className={cn('relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold', className)} {...props}>
      {children}
    </code>
  );
}
