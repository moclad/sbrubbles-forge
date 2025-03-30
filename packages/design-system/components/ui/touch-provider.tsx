'use client';

import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { PopoverContentProps, PopoverProps, PopoverTriggerProps } from '@radix-ui/react-popover';
import { TooltipContentProps, TooltipProps, TooltipTriggerProps } from '@radix-ui/react-tooltip';

import { cn } from '../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const TouchContext = createContext<boolean | undefined>(undefined);
const useTouch = () => useContext(TouchContext);

export const TouchProvider = (props: PropsWithChildren) => {
  const [isTouch, setIsTouch] = useState<boolean>();

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  return <TouchContext.Provider value={isTouch} {...props} />;
};

export const HybridTooltip = (props: TooltipProps & PopoverProps) => {
  const isTouch = useTouch();

  return isTouch ? <Popover {...props} /> : <Tooltip {...props} />;
};

export const HybridTooltipTrigger = (props: TooltipTriggerProps & PopoverTriggerProps) => {
  const isTouch = useTouch();

  return isTouch ? <PopoverTrigger {...props} /> : <TooltipTrigger {...props} />;
};

export const HybridTooltipContent = (props: TooltipContentProps & PopoverContentProps) => {
  const isTouch = useTouch();

  return isTouch ? (
    <PopoverContent
      className={cn(
        'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        props.className,
      )}
      {...props}
    />
  ) : (
    <TooltipContent {...props} />
  );
};
