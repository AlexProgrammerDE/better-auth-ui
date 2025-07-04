"use client"

import { useContext } from "react"
import { useForm } from "react-hook-form"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import type { AuthClient } from "../../types/auth-client"
import { CardContent } from "../ui/card"
import { Form } from "../ui/form"
import { PasskeyCell } from "./passkey-cell"
import { SettingsCard } from "./shared/settings-card"
import type { SettingsCardClassNames } from "./shared/settings-card"
import { SettingsCellSkeleton } from "./skeletons/settings-cell-skeleton"

export interface PasskeysCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    isPending?: boolean
    localization?: AuthLocalization
    passkeys?: { id: string; createdAt: Date }[] | null
    skipHook?: boolean
    refetch?: () => Promise<void>
}

export function PasskeysCard({
    className,
    classNames,
    isPending,
    localization,
    passkeys,
    skipHook,
    refetch
}: PasskeysCardProps) {
    const {
        authClient,
        hooks: { useListPasskeys },
        localization: authLocalization,
        toast
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    if (!skipHook) {
        const result = useListPasskeys()
        passkeys = result.data
        isPending = result.isPending
        refetch = result.refetch
    }

    const addPasskey = async () => {
        try {
            await (authClient as AuthClient).passkey.addPasskey({ fetchOptions: { throw: true } })
            await refetch?.()
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }
    }

    const form = useForm()

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(addPasskey)}>
                <SettingsCard
                    className={className}
                    classNames={classNames}
                    actionLabel={localization.addPasskey}
                    description={localization.passkeysDescription}
                    instructions={localization.passkeysInstructions}
                    isPending={isPending}
                    title={localization.passkeys}
                >
                    <CardContent className={cn("grid gap-4", classNames?.content)}>
                        {isPending ? (
                            <SettingsCellSkeleton classNames={classNames} />
                        ) : (
                            passkeys?.map((passkey) => (
                                <PasskeyCell
                                    key={passkey.id}
                                    classNames={classNames}
                                    localization={localization}
                                    passkey={passkey}
                                    refetch={refetch}
                                />
                            ))
                        )}
                    </CardContent>
                </SettingsCard>
            </form>
        </Form>
    )
}
