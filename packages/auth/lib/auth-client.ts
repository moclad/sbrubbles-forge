import type {
    anonymousClient,
    genericOAuthClient,
    magicLinkClient,
    multiSessionClient,
    passkeyClient,
    twoFactorClient,
    usernameClient
} from "better-auth/client/plugins"
import type { createAuthClient } from "better-auth/react"

type MultiSessionClientPlugin = ReturnType<typeof multiSessionClient>
type PasskeyClientPlugin = ReturnType<typeof passkeyClient>
type GenericOAuthClientPlugin = ReturnType<typeof genericOAuthClient>
type AnonymousClientPlugin = ReturnType<typeof anonymousClient>
type UsernameClientPlugin = ReturnType<typeof usernameClient>
type MagicLinkClientPlugin = ReturnType<typeof magicLinkClient>
type TwoFactorClientPlugin = ReturnType<typeof twoFactorClient>

export type AuthClient = ReturnType<
    typeof createAuthClient<{
        plugins: [
            MultiSessionClientPlugin,
            PasskeyClientPlugin,
            GenericOAuthClientPlugin,
            AnonymousClientPlugin,
            UsernameClientPlugin,
            MagicLinkClientPlugin,
            TwoFactorClientPlugin
        ]
    }>
>

export type Session = AuthClient["$Infer"]["Session"]["session"]
export type User = AuthClient["$Infer"]["Session"]["user"]
