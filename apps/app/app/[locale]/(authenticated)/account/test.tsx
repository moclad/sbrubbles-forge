'use client';
import { Bell, Lock, User } from 'lucide-react';
import { useState } from 'react';

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

export const UserAccountA = () => {
  const t = useI18n();
  const [activeTab, setActiveTab] = useState('account');

  return (
    <Tabs
      defaultValue='account'
      orientation='horizontal'
      value={activeTab}
      onValueChange={setActiveTab}
      className='mx-auto max-w-2xl bg-red-400'
    >
      <TabsList className='w-full'>
        <TabsTrigger value='account' className='flex items-center gap-2'>
          <User className='size-4' />
          Account
        </TabsTrigger>
        <TabsTrigger value='security' className='flex items-center gap-2'>
          <Lock className='size-4' />
          Security
        </TabsTrigger>
        <TabsTrigger value='notifications' className='flex items-center gap-2'>
          <Bell className='size-4' />
          Notifications
        </TabsTrigger>
      </TabsList>
      <TabsContent value='account' className='space-y-6 pt-4'>
        <UpdateAvatarCard />
      </TabsContent>
      <TabsContent value='security' className='space-y-6 pt-4'>
        <div></div>
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
