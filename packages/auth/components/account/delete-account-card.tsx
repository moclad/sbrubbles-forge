import { useContext, useState } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { DeleteAccountDialog } from "./delete-account-dialog"
import { SettingsCard, type SettingsCardClassNames } from "./shared/settings-card"

export interface DeleteAccountCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    accounts?: { provider: string }[] | null
    isPending?: boolean
    localization?: AuthLocalization
    skipHook?: boolean
}

export function DeleteAccountCard({
    className,
    classNames,
    accounts,
    isPending,
    localization,
    skipHook
}: DeleteAccountCardProps) {
    const {
        hooks: { useSession, useListAccounts },
        localization: authLocalization
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }
    const [showDialog, setShowDialog] = useState(false)

    if (!skipHook) {
        const result = useListAccounts()
        accounts = result.data
        isPending = result.isPending
    }

    return (
        <>
            <SettingsCard
                title={localization?.deleteAccount}
                description={localization?.deleteAccountDescription}
                actionLabel={localization?.deleteAccount}
                formAction={() => setShowDialog(true)}
                className={className}
                classNames={classNames}
                variant="destructive"
                isPending={isPending}
            />

            <DeleteAccountDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                localization={localization}
                classNames={classNames}
                accounts={accounts}
            />
        </>
    )
}
