'use client';
import { ReactNode } from 'react';

type PageContentContainerProps = {
  children: ReactNode;
};

export function PageContentContainer({
  children,
}: Readonly<PageContentContainerProps>) {
  return (
    <div className='min-h-[100vh] flex-1 rounded-sm border p-2 md:min-h-min'>
      {children}
    </div>
  );
}
