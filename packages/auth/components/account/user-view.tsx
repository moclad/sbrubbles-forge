import { cn } from "../lib/utils"
import type { Profile } from "../types/profile"
import { Skeleton } from "./ui/skeleton"
import { UserAvatar, type UserAvatarClassNames } from "./user-avatar"

export interface UserClassNames {
    base?: string
    avatar?: UserAvatarClassNames
    p?: string
    small?: string
}

export interface UserProps {
    className?: string
    classNames?: UserClassNames
    isPending?: boolean
    user?: Profile
}

/**
 * Displays user information with avatar and details in a compact view
 *
 * Renders a user's profile information with appropriate fallbacks:
 * - Shows avatar alongside user name and email when available
 * - Shows loading skeletons when isPending is true
 * - Falls back to generic "User" text when neither name nor email is available
 * - Supports customization through classNames prop
 */
export function UserView({ user, className, classNames, isPending }: UserProps) {
    return (
        <div className={cn("flex items-center gap-2 truncate", className, classNames?.base)}>
            <UserAvatar
                isPending={isPending}
                user={user}
                className="my-0.5"
                classNames={classNames?.avatar}
            />

            <div className="flex flex-col truncate text-left">
                {isPending ? (
                    <>
                        <Skeleton className={cn("my-0.5 h-4 w-24 max-w-full", classNames?.p)} />
                        <Skeleton className={cn("my-0.5 h-3 w-32 max-w-full", classNames?.small)} />
                    </>
                ) : (
                    <>
                        <span className={cn("truncate font-medium text-sm", classNames?.p)}>
                            {user?.name || user?.email || "User"}
                        </span>

                        {user?.name && user?.email && (
                            <span
                                className={cn(
                                    "!font-light truncate text-muted-foreground text-xs",
                                    classNames?.small
                                )}
                            >
                                {user.email}
                            </span>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
