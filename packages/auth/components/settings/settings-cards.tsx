'use client';

import type { Session, User } from 'better-auth';
import { KeyIcon, UserIcon } from 'lucide-react';
import { useContext } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { cn } from '@repo/design-system/lib/utils';

import { useI18n } from '../../../localization/i18n/client';
import { useAuthenticate } from '../../hooks/use-authenticate';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { AccountsCard } from './accounts-card';
import { ChangeEmailCard } from './change-email-card';
import { ChangePasswordCard } from './change-password-card';
import { DeleteAccountCard } from './delete-account-card';
import { PasskeysCard } from './passkeys-card';
import { ProvidersCard } from './providers-card';
import { SessionsCard } from './sessions-card';
import { UpdateFieldCard } from './shared/update-field-card';
import { TwoFactorCard } from './two-factor/two-factor-card';
import { UpdateAvatarCard } from './update-avatar-card';
import { UpdateNameCard } from './update-name-card';
import { UpdateUsernameCard } from './update-username-card';

import type { SettingsCardClassNames } from './shared/settings-card';
export type SettingsCardsClassNames = {
  base?: string;
  card?: SettingsCardClassNames;
  tabs?: {
    base?: string;
    list?: string;
    trigger?: string;
    content?: string;
  };
};

export interface SettingsCardsProps {
  className?: string;
  classNames?: SettingsCardsClassNames;
}

export function SettingsCards({
  className,
  classNames,
}: Readonly<SettingsCardsProps>) {
  useAuthenticate();

  const {
    additionalFields,
    avatar,
    credentials,
    changeEmail,
    deleteUser,
    hooks,
    multiSession,
    nameRequired,
    otherProviders,
    passkey,
    providers,
    settingsFields,
    username,
    twoFactor,
  } = useContext(AuthUIContext);

  const t = useI18n();
  const {
    useListAccounts,
    useListDeviceSessions,
    useListPasskeys,
    useListSessions,
    useSession,
  } = hooks;
  const { data: sessionData, isPending: sessionPending } = useSession();

  const {
    data: accounts,
    isPending: accountsPending,
    refetch: refetchAccounts,
  } = useListAccounts();

  const credentialsLinked = accounts?.some(
    (acc) => acc.provider === 'credential'
  );

  const {
    data: sessions,
    isPending: sessionsPending,
    refetch: refetchSessions,
  } = useListSessions();

  let passkeys: { id: string; createdAt: Date }[] | undefined | null;
  let passkeysPending: boolean | undefined;
  let refetchPasskeys: (() => Promise<void>) | undefined;

  if (passkey) {
    const result = useListPasskeys();
    passkeys = result.data;
    passkeysPending = result.isPending;
    refetchPasskeys = result.refetch;
  }

  let deviceSessions: { user: User; session: Session }[] | undefined | null;
  let deviceSessionsPending: boolean | undefined;
  let refetchDeviceSessions: (() => Promise<void>) | undefined;

  if (multiSession) {
    const result = useListDeviceSessions();
    deviceSessions = result.data;
    deviceSessionsPending = result.isPending;
    refetchDeviceSessions = result.refetch;
  }

  return (
    <div
      className={cn(
        'flex w-full max-w-xl grow flex-col items-center gap-4 bg-green-100',
        className,
        classNames?.base
      )}
    >
      <Tabs
        defaultValue='account'
        className={cn('flex w-full flex-col gap-4', classNames?.tabs?.base)}
      >
        <TabsList
          className={cn('grid w-full grid-cols-2', classNames?.tabs?.list)}
        >
          <TabsTrigger value='account' className={classNames?.tabs?.trigger}>
            <UserIcon />

            {t('account.account')}
          </TabsTrigger>

          <TabsTrigger value='security' className={classNames?.tabs?.trigger}>
            <KeyIcon />

            {t('account.security')}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value='account'
          className={cn('flex flex-col gap-4', classNames?.tabs?.content)}
        >
          {avatar && (
            <UpdateAvatarCard
              classNames={classNames?.card}
              isPending={sessionPending}
            />
          )}

          {username && (
            <UpdateUsernameCard
              classNames={classNames?.card}
              isPending={sessionPending}
            />
          )}

          {(settingsFields?.includes('name') || nameRequired) && (
            <UpdateNameCard
              classNames={classNames?.card}
              isPending={sessionPending}
            />
          )}

          {changeEmail && (
            <ChangeEmailCard
              classNames={classNames?.card}
              isPending={sessionPending}
            />
          )}

          {settingsFields?.map((field) => {
            const additionalField = additionalFields?.[field];
            if (!additionalField) {
              return null;
            }

            const {
              label,
              description,
              instructions,
              placeholder,
              required,
              type,
              validate,
            } = additionalField;

            // @ts-ignore Custom fields are not typed
            const defaultValue = sessionData?.user[field] as unknown;

            return (
              <UpdateFieldCard
                key={field}
                classNames={classNames?.card}
                defaultValue={defaultValue}
                description={description}
                field={field}
                instructions={instructions}
                isPending={sessionPending}
                label={label}
                placeholder={placeholder}
                required={required}
                type={type}
                validate={validate}
              />
            );
          })}

          {multiSession && (
            <AccountsCard
              classNames={classNames?.card}
              deviceSessions={deviceSessions}
              isPending={deviceSessionsPending}
              refetch={refetchDeviceSessions}
              skipHook
            />
          )}
        </TabsContent>

        <TabsContent
          value='security'
          className={cn('flex flex-col gap-4', classNames?.tabs?.content)}
        >
          {credentials && (
            <ChangePasswordCard
              accounts={accounts}
              classNames={classNames?.card}
              isPending={sessionPending}
              skipHook
            />
          )}

          {(providers?.length || otherProviders?.length) && (
            <ProvidersCard
              accounts={accounts}
              classNames={classNames?.card}
              isPending={accountsPending}
              refetch={refetchAccounts}
              skipHook
            />
          )}

          {passkey && (
            <PasskeysCard
              classNames={classNames?.card}
              isPending={passkeysPending}
              passkeys={passkeys}
              refetch={refetchPasskeys}
              skipHook
            />
          )}

          {twoFactor && credentialsLinked && (
            <TwoFactorCard classNames={classNames?.card} />
          )}

          <SessionsCard
            classNames={classNames?.card}
            isPending={sessionsPending}
            sessions={sessions}
            refetch={refetchSessions}
            skipHook
          />

          {deleteUser && (
            <DeleteAccountCard
              accounts={accounts}
              classNames={classNames?.card}
              isPending={sessionPending}
              skipHook
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
