'use client';
import { ReactNode } from 'react';

type PageContentContainerProps = {
  children: ReactNode;
};

export function PageContentContainer({
  children,
}: Readonly<PageContentContainerProps>) {
  return (
    <div className='w-full md:flex'>
      <div className='h-full flex-1 flex-col space-y-4'>{children}</div>
    </div>
  );
}
