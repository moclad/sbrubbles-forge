'use client';

import { useContext, useRef, useState } from 'react';

import { Card } from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { toast } from '@repo/design-system/components/ui/sonner';
import { cn } from '@repo/design-system/lib/utils';
import { useI18n } from '@repo/localization/i18n/client';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { getErrorMessage } from '../../lib/get-error-message';
import { UserAvatar } from '../user-avatar';
import { SettingsCardFooter } from './shared/settings-card-footer';
import { SettingsCardHeader } from './shared/settings-card-header';

import type { SettingsCardClassNames } from './shared/settings-card';

async function resizeAndCropImage(
  file: File,
  name: string,
  size: number,
  avatarExtension: string
): Promise<File> {
  const image = await loadImage(file);

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;

  const ctx = canvas.getContext('2d');

  const minEdge = Math.min(image.width, image.height);

  const sx = (image.width - minEdge) / 2;
  const sy = (image.height - minEdge) / 2;
  const sWidth = minEdge;
  const sHeight = minEdge;

  ctx?.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, size, size);

  const resizedImageBlob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, `image/${avatarExtension}`)
  );

  return new File(
    [resizedImageBlob as BlobPart],
    `${name}.${avatarExtension}`,
    {
      type: `image/${avatarExtension}`,
    }
  );
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      image.src = e.target?.result as string;
    };

    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);

    reader.readAsDataURL(file);
  });
}

export interface UpdateAvatarCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  isPending?: boolean;
}

export function UpdateAvatarCard({
  className,
  classNames,
  isPending: externalIsPending,
}: Readonly<UpdateAvatarCardProps>) {
  const {
    hooks: { useSession },
    mutators: { updateUser },
    optimistic,
    uploadAvatar,
    avatarSize,
    avatarExtension,
  } = useContext(AuthUIContext);

  const { data: sessionData, isPending: sessionPending } = useSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const t = useI18n();

  const handleAvatarChange = async (file: File) => {
    if (!sessionData) {
      return;
    }

    setLoading(true);
    const resizedFile = await resizeAndCropImage(
      file,
      sessionData.user.id,
      avatarSize,
      avatarExtension
    );

    let image: string | undefined | null;

    if (uploadAvatar) {
      image = await uploadAvatar(resizedFile);
    } else {
      image = await fileToBase64(resizedFile);
    }

    if (!image) {
      setLoading(false);
      return;
    }

    if (optimistic && !uploadAvatar) {
      setLoading(false);
    }

    try {
      await updateUser({ image });
      toast.success(t('account.avatarUpdated'));
    } catch (error) {
      toast.error(getErrorMessage(error) ?? t('account.requestFailed'));
    }

    setLoading(false);
  };

  const openFileDialog = () => fileInputRef.current?.click();

  const isPending = externalIsPending || sessionPending;

  return (
    <Card
      className={cn(
        'w-full pb-0 text-start shadow-lg',
        className,
        classNames?.base
      )}
    >
      <input
        ref={fileInputRef}
        accept='image/*'
        disabled={loading}
        hidden
        type='file'
        onChange={(e) => {
          const file = e.target.files?.item(0);
          if (file) {
            handleAvatarChange(file);
          }
        }}
      />

      <div className='flex justify-between'>
        <SettingsCardHeader
          className='grow self-start'
          title={t('account.avatar')}
          description={t('account.avatarDescription')}
          isPending={isPending}
          classNames={classNames}
        />

        <button type='button' onClick={openFileDialog}>
          {isPending || loading ? (
            <Skeleton
              className={cn('size-20 rounded-full', classNames?.avatar?.base)}
            />
          ) : (
            <UserAvatar
              key={sessionData?.user.image}
              className='m-4 size-10 text-2xl'
              classNames={classNames?.avatar}
              user={sessionData?.user}
            />
          )}
        </button>
      </div>

      <SettingsCardFooter
        className='!py-5'
        instructions={t('account.avatarInstructions')}
        classNames={classNames}
        isPending={isPending}
        isSubmitting={loading}
      />
    </Card>
  );
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
