"use client"

import { useContext } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { SettingsCardClassNames } from "./shared/settings-card"
import { UpdateFieldCard } from "./shared/update-field-card"

export interface UpdateUsernameCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    isPending?: boolean
    localization?: AuthLocalization
}

export function UpdateUsernameCard({
    className,
    classNames,
    isPending,
    localization
}: UpdateUsernameCardProps) {
    const { hooks, localization: authLocalization } = useContext(AuthUIContext)
    const { useSession } = hooks
    localization = { ...authLocalization, ...localization }

    const { data: sessionData } = useSession()
    const defaultValue = sessionData?.user.displayUsername || sessionData?.user.username

    return (
        <UpdateFieldCard
            key={defaultValue}
            className={className}
            classNames={classNames}
            defaultValue={defaultValue}
            description={localization.usernameDescription}
            field="username"
            instructions={localization.usernameInstructions}
            isPending={isPending}
            label={localization.username}
            localization={localization}
            placeholder={localization.usernamePlaceholder}
            required
        />
    )
}
