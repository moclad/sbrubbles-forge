'use client';
import { useState } from 'react';

import { UpdateAvatarAndNameBody } from '@/components/update-avatar-name';
import { updateUserProfileNameAndAvatar, uploadPublicUserAvatar } from '@/data/user/user';
import { useToastMutation } from '@/hooks/useToastMutation';
import { useI18n } from '@/i18n/client';
import { Table } from '@/types';

export function AccountSettings({ userProfile }: { userProfile: Table<'user_profiles'> }) {
  const t = useI18n();
  const { mutate, isPending } = useToastMutation(
    async ({ fullName, avatarUrl }: { fullName: string; avatarUrl?: string }) => {
      return await updateUserProfileNameAndAvatar({
        fullName,
        avatarUrl,
      });
    },
    {
      loadingMessage: t('account.settings.updating'),
      errorMessage: t('account.settings.error'),
      successMessage: t('account.settings.success'),
    },
  );
  // This loading state is for the new avatar image
  // being fetched from the server to the browser. At this point the
  // upload is complete, but the new image is not yet available to the browser.
  const [isNewAvatarImageLoading, setIsNewAvatarImageLoading] = useState<boolean>(false);

  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(userProfile.avatar_url ?? undefined);

  const { mutate: upload, isPending: isUploading } = useToastMutation(
    async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return await uploadPublicUserAvatar(formData, file.name, {
        upsert: true,
      });
    },
    {
      loadingMessage: t('account.settings.avatar.uploading'),
      errorMessage: t('account.settings.avatar.error'),
      successMessage: t('account.settings.avatar.success'),
      onSuccess(data) {
        if (data.status === 'success') {
          setAvatarUrl(data.data);
        }
      },
    },
  );

  return (
    <div className='max-w-2xl'>
      <UpdateAvatarAndNameBody
        onSubmit={(fullName: string) => {
          mutate({
            fullName,
            avatarUrl,
          });
        }}
        onFileUpload={(file: File) => {
          upload(file);
        }}
        isNewAvatarImageLoading={isNewAvatarImageLoading}
        setIsNewAvatarImageLoading={setIsNewAvatarImageLoading}
        isUploading={isUploading}
        isPending={isPending ?? isUploading}
        profileAvatarUrl={avatarUrl}
        profileFullname={userProfile.full_name ?? undefined}
      />
    </div>
  );
}
