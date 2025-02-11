import { clsx } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

import { parseError } from '@repo/observability/error';

import type { ClassValue } from 'clsx';
export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const handleError = (error: unknown): void => {
  const message = parseError(error);

  toast.error(message);
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
