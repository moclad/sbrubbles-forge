import { parseError } from '@repo/observability/error';
import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const handleError = (error: unknown): void => {
  const message = parseError(error);

  toast.error(message);
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
