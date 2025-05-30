'use client';
import { Bell, Lock, User } from 'lucide-react';
import { useState } from 'react';

import { UpdateAvatarCard } from '@repo/auth/components/settings/update-avatar-card';
import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';
import { Switch } from '@repo/design-system/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import { useI18n } from '@repo/localization/i18n/client';

import { ChangeEmailCard } from './settings/change-email-card';
import { ChangePasswordCard } from './settings/change-password-card';
import { DeleteAccountCard } from './settings/delete-account-card';
import { PasskeysCard } from './settings/passkeys-card';
import { ProvidersCard } from './settings/providers-card';
import { SessionsCard } from './settings/sessions-card';
import { TwoFactorCard } from './settings/two-factor/two-factor-card';
import { UpdateNameCard } from './settings/update-name-card';

export const UserAccount = () => {
  const t = useI18n();
  const [activeTab, setActiveTab] = useState('account');

  return (
    <Tabs
      defaultValue='account'
      orientation='vertical'
      value={activeTab}
      onValueChange={setActiveTab}
      className='space-y-6'
    >
      <TabsList className='w-full'>
        <TabsTrigger value='account' className='flex items-center gap-2'>
          <User className='size-4' />
          {t('account.account')}
        </TabsTrigger>
        <TabsTrigger value='security' className='flex items-center gap-2'>
          <Lock className='size-4' />
          {t('account.security')}
        </TabsTrigger>
        <TabsTrigger value='notifications' className='flex items-center gap-2'>
          <Bell className='size-4' />
          {t('account.notifications')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value='account' className='space-y-6 pt-4'>
        <UpdateAvatarCard />
        <UpdateNameCard />
        <ChangeEmailCard />
      </TabsContent>
      <TabsContent value='security' className='space-y-6 pt-4'>
        <ChangePasswordCard />
        <ProvidersCard />
        <TwoFactorCard />
        <PasskeysCard />
        <SessionsCard />
        <DeleteAccountCard />
      </TabsContent>
      <TabsContent value='notifications' className='space-y-6 pt-4'>
        <div className='space-y-4'>
          <div className='space-y-4'>
            <h3 className='font-medium text-lg'>Email Notifications</h3>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='email-updates'>Account Updates</Label>
                <p className='text-muted-foreground text-sm'>
                  Receive emails about your account activity and security.
                </p>
              </div>
              <Switch id='email-updates' defaultChecked />
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='font-medium text-lg'>Push Notifications</h3>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='push-everything'>All Notifications</Label>
                <p className='text-muted-foreground text-sm'>
                  Get notified about all activity.
                </p>
              </div>
              <Switch id='push-everything' />
            </div>
          </div>
        </div>

        <Button className='w-full sm:w-auto'>
          Save Notification Preferences
        </Button>
      </TabsContent>
    </Tabs>
  );
};
