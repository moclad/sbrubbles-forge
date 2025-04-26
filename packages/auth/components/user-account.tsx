'use client';
import { Bell, Lock, User } from 'lucide-react';
import { useState } from 'react';

import { UpdateAvatarCard } from '@repo/auth/components/settings/update-avatar-card';
import {} from '@repo/design-system/components/ui/avatar';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
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
import { UpdateNameCard } from './settings/update-name-card';

export const UserAccount = () => {
  const t = useI18n();
  const [activeTab, setActiveTab] = useState('account');

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className='grid grid-cols-1'
    >
      <TabsList className='grid w-full grid-cols-3'>
        <TabsTrigger value='account' className='flex items-center gap-2'>
          <User className='h-4 w-4' />
          Account Information
        </TabsTrigger>
        <TabsTrigger value='security' className='flex items-center gap-2'>
          <Lock className='h-4 w-4' />
          Security
        </TabsTrigger>
        <TabsTrigger value='notifications' className='flex items-center gap-2'>
          <Bell className='h-4 w-4' />
          Notifications
        </TabsTrigger>
      </TabsList>
      <TabsContent value='account' className='space-y-6 pt-4'>
        <div className='flex flex-col gap-6'>
          <UpdateAvatarCard />
        </div>
        <UpdateNameCard />
        <ChangeEmailCard />
      </TabsContent>

      <TabsContent value='security' className='space-y-6 pt-4'>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='current-password'>Current Password</Label>
            <Input id='current-password' type='password' />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='new-password'>New Password</Label>
            <Input id='new-password' type='password' />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirm-password'>Confirm New Password</Label>
            <Input id='confirm-password' type='password' />
          </div>
        </div>

        <Button className='w-full sm:w-auto'>Update Password</Button>
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
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='email-marketing'>Marketing Emails</Label>
                <p className='text-muted-foreground text-sm'>
                  Receive emails about new products, features, and more.
                </p>
              </div>
              <Switch id='email-marketing' />
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
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='push-mentions'>Mentions</Label>
                <p className='text-muted-foreground text-sm'>
                  Get notified when you're mentioned in comments.
                </p>
              </div>
              <Switch id='push-mentions' defaultChecked />
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
