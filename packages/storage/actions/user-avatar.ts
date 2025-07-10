import { log } from '@repo/observability/log';

import { PUBLIC_ASSETS_BUCKET } from '../buckets';
import { storageClient } from '../server';

export async function getAvatarUploadUrl(userId: string, _extension: string) {
  await storageClient;
  const { data, error } = await storageClient
    .from(PUBLIC_ASSETS_BUCKET)
    .createSignedUploadUrl(`/avatar/${userId}/avatar.${_extension}`, {
      upsert: true,
    });

  log.info(error?.message ?? '');

  if (error) {
    throw new Error(`Failed to create url: ${error.message}`);
  }

  return data;
}

export async function uploadUserAvatar(
  userId: string,
  fileStream: File | Blob
) {
  const { data, error } = await storageClient
    .from(PUBLIC_ASSETS_BUCKET)
    .upload(`${userId}/avatar`, fileStream, { upsert: true });

  if (error) {
    throw new Error(`Failed to upload avatar: ${error.message}`);
  }

  return data;
}

export async function getAvatarUrl(
  userId: string,
  expiresInSeconds = 60 * 60 * 24 * 7
) {
  // 7 days
  const { data, error } = await storageClient
    .from(PUBLIC_ASSETS_BUCKET)
    .createSignedUrl(`${userId}/avatar`, expiresInSeconds);

  if (error) {
    throw new Error(`Failed to get avatar URL: ${error.message}`);
  }

  return data.signedUrl;
}

export async function deleteUserAvatar(userId: string) {
  const { error } = await storageClient
    .from(PUBLIC_ASSETS_BUCKET)
    .remove([`${userId}/avatar`]);

  if (error) {
    throw new Error(`Failed to delete avatar: ${error.message}`);
  }

  return true;
}

export async function getUserAvatarInfo(userId: string) {
  const { data, error } = await storageClient
    .from(PUBLIC_ASSETS_BUCKET)
    .list(userId, {
      limit: 1,
      search: 'avatar',
    });

  if (error) {
    throw new Error(`Failed to get avatar info: ${error.message}`);
  }

  return data.length > 0 ? data[0] : null;
}
