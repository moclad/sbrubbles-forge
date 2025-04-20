'use client';

import type React from 'react';

import { Bell, Lock, User } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components/ui/avatar';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@repo/design-system/components/ui/card';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Switch } from '@repo/design-system/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [avatar, setAvatar] = useState('/placeholder.svg?height=100&width=100');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatar(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className='container mx-auto py-10'>
      <Card className='mx-auto max-w-2xl'>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account settings and set your preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
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
              <TabsTrigger
                value='notifications'
                className='flex items-center gap-2'
              >
                <Bell className='h-4 w-4' />
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value='account' className='space-y-6 pt-4'>
              <div className='flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0'>
                <Avatar className='h-24 w-24'>
                  <AvatarImage
                    src={avatar || '/placeholder.svg'}
                    alt='User avatar'
                  />
                  <AvatarFallback>UN</AvatarFallback>
                </Avatar>
                <div className='flex flex-col space-y-2'>
                  <Label htmlFor='avatar' className='font-medium text-sm'>
                    Profile Picture
                  </Label>
                  <Input
                    id='avatar'
                    type='file'
                    accept='image/*'
                    onChange={handleAvatarChange}
                    className='w-full'
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Full Name</Label>
                  <Input
                    id='name'
                    placeholder='John Doe'
                    defaultValue='John Doe'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>Email Address</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='john.doe@example.com'
                    defaultValue='john.doe@example.com'
                  />
                </div>
              </div>

              <Button className='w-full sm:w-auto'>
                Save Account Information
              </Button>
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
        </CardContent>
        <CardFooter className='flex justify-between border-t p-6'>
          <Button variant='outline'>Cancel</Button>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
