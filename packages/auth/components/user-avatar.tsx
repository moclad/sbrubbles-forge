import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/design-system/components/ui/avatar';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { cn } from '@repo/design-system/lib/utils';
import { UserIcon } from 'lucide-react';

import type { ComponentProps } from 'react';

import type { Profile } from '../types/profile';

export interface UserAvatarClassNames {
  base?: string;
  image?: string;
  fallback?: string;
  fallbackIcon?: string;
  skeleton?: string;
}

export interface UserAvatarProps {
  user?: Profile;
  classNames?: UserAvatarClassNames;
  isPending?: boolean;
}

/**
 * Displays a user avatar with image and fallback support
 *
 * Renders a user's avatar image when available, with appropriate fallbacks:
 * - Shows a skeleton when isPending is true
 * - Displays first two characters of user's name when no image is available
 * - Falls back to a generic user icon when neither image nor name is available
 */
export function UserAvatar({
  user,
  classNames,
  className,
  isPending,
  ...props
}: UserAvatarProps & ComponentProps<typeof Avatar>) {
  const name = user?.name ?? user?.fullName ?? user?.firstName ?? user?.email;
  const src = user?.image ?? user?.avatar ?? user?.avatarUrl;

  if (isPending) {
    return (
      <Skeleton
        className={cn(
          'size-8 shrink-0 rounded-full',
          className,
          classNames?.base,
          classNames?.skeleton
        )}
      />
    );
  }

  return (
    <Avatar className={cn('bg-muted', className, classNames?.base)} {...props}>
      <AvatarImage
        alt={name ?? 'User image'}
        className={classNames?.image}
        src={src ?? undefined}
      />

      <AvatarFallback
        className={cn('rounded-lg uppercase', classNames?.fallback)}
        delayMs={src ? 600 : undefined}
      >
        <UserIcon className={classNames?.fallbackIcon} />
      </AvatarFallback>
    </Avatar>
  );
}
