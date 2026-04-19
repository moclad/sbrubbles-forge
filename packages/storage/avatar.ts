import { log } from '../observability/log';
import { PUBLIC_ASSETS_BUCKET } from './buckets';
import { initializeStandardBuckets, storageClient } from './server';

export async function getAvatarUploadUrl(token: string, userId: string, _extension: string) {
  await initializeStandardBuckets();
  await storageClient;
  const { data, error } = await storageClient(token).from(PUBLIC_ASSETS_BUCKET).createSignedUploadUrl(`/avatar/${userId}/avatar.${_extension}`, {
    upsert: true,
  });

  log.info(error?.message ?? '');

  if (error) {
    throw new Error(`Failed to create url: ${error.message}`);
  }

  return data;
}
