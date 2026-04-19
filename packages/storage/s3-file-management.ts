// biome-ignore assist/source/organizeImports: minio package does not provide a default export
// biome-ignore lint/performance/noNamespaceImport: minio package does not provide a default export
import * as Minio from 'minio';

import { log } from '@repo/observability/log';

import { keys } from './keys';

import type internal from 'node:stream';

const storageUrl = new URL(keys().S3_STORAGE_URL ?? 'http://localhost');

export const s3Client = new Minio.Client({
  accessKey: keys().S3_ACCESS_KEY ?? '',
  endPoint: storageUrl.hostname,
  port: storageUrl.port ? Number(storageUrl.port) : undefined,
  secretKey: keys().S3_SECRET_KEY ?? '',
  useSSL: storageUrl.protocol === 'https:',
});

export async function createBucketIfNotExists(bucketName: string) {
  const bucketExists = await s3Client.bucketExists(bucketName);
  if (!bucketExists) {
    await s3Client.makeBucket(bucketName);
  }
}

export async function saveFileInBucket({ bucketName, fileName, file }: { bucketName: string; fileName: string; file: Buffer | internal.Readable }) {
  // Create bucket if it doesn't exist
  await createBucketIfNotExists(bucketName);

  // check if file exists
  const fileExists = await checkFileExistsInBucket({
    bucketName,
    fileName,
  });

  if (fileExists) {
    throw new Error('File already exists');
  }

  // Upload image to S3 bucket
  await s3Client.putObject(bucketName, fileName, file);
}

export async function checkFileExistsInBucket({ bucketName, fileName }: { bucketName: string; fileName: string }) {
  try {
    await s3Client.statObject(bucketName, fileName);
  } catch {
    return false;
  }
  return true;
}

export async function getFileFromBucket({ bucketName, fileName }: { bucketName: string; fileName: string }) {
  try {
    await s3Client.statObject(bucketName, fileName);
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      log.error((error as { message: string }).message);
    } else {
      log.error(String(error));
    }
    return null;
  }
  return await s3Client.getObject(bucketName, fileName);
}

export async function deleteFileFromBucket({ bucketName, fileName }: { bucketName: string; fileName: string }) {
  try {
    await s3Client.removeObject(bucketName, fileName);
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      log.error((error as { message: string }).message);
    } else {
      log.error(String(error));
    }

    return false;
  }
  return true;
}

export async function createPresignedUrlToUpload({
  bucketName,
  fileName,
  expiry = 60 * 60, // 1 hour
}: {
  bucketName: string;
  fileName: string;
  expiry?: number;
}) {
  // Create bucket if it doesn't exist
  await createBucketIfNotExists(bucketName);

  return await s3Client.presignedPutObject(bucketName, fileName, expiry);
}

export async function createPresignedUrlToDownload({
  bucketName,
  fileName,
  expiry = 60 * 60, // 1 hour
}: {
  bucketName: string;
  fileName: string;
  expiry?: number;
}) {
  return await s3Client.presignedGetObject(bucketName, fileName, expiry);
}
