// biome-ignore lint/performance/noNamespaceImport: minio package does not provide a default export

import type internal from 'node:stream';
import { database, eq } from '@repo/database';
import { s3_objects } from '@repo/database/db/storage';
import { log } from '@repo/observability/log';
import * as Minio from 'minio';
import { nanoid } from 'nanoid';

import { keys } from './keys';

const TRAILING_SLASH_RE = /\/$/;

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

export async function saveFileInBucket({
  bucketName,
  fileName,
  file,
}: {
  bucketName: string;
  fileName: string;
  file: Buffer | internal.Readable;
}) {
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

/**
 * Construct a public URL for a file in an S3 bucket
 */
export function getFileUrl(bucketName: string, fileName: string): string {
  const storageUrl = keys().S3_STORAGE_URL ?? 'http://localhost:9000';
  return `${storageUrl.replace(TRAILING_SLASH_RE, '')}/${bucketName}/${fileName}`;
}

/**
 * Upload a file to S3 and save metadata to database
 */
export async function uploadFile({
  bucket,
  pathPrefix,
  file,
  userId,
  originalFileName,
}: {
  bucket: string;
  pathPrefix: string;
  file: Buffer;
  userId: string;
  originalFileName: string;
}): Promise<{
  fileId: string;
  fileName: string;
  url: string;
  fileSize: number;
}> {
  // Create bucket if it doesn't exist
  await createBucketIfNotExists(bucket);

  // Generate unique filename
  const ext = originalFileName.includes('.') ? originalFileName.split('.').pop()?.toLowerCase() : '';
  const uniqueId = nanoid(10);
  const fileName = `${pathPrefix}${uniqueId}${ext ? `.${ext}` : ''}`;

  // Upload to S3
  await s3Client.putObject(bucket, fileName, file, file.length);

  // Save metadata to database
  const fileId = crypto.randomUUID();
  await database.insert(s3_objects).values({
    bucket,
    created_by: userId,
    createdAt: new Date(),
    fileName,
    fileSize: file.length,
    id: fileId,
    originalFileName,
    updated_by: userId,
    updatedAt: new Date(),
  });

  const url = getFileUrl(bucket, fileName);

  return {
    fileId,
    fileName,
    fileSize: file.length,
    url,
  };
}

/**
 * Delete a file from S3 and database by file ID
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    // Get file metadata from database
    const fileRecord = await database.query.s3_objects.findFirst({
      where: eq(s3_objects.id, fileId),
    });

    if (!fileRecord) {
      log.error(`File not found in database: ${fileId}`);
      return false;
    }

    // Delete from S3
    await s3Client.removeObject(fileRecord.bucket, fileRecord.fileName);

    // Delete from database
    await database.delete(s3_objects).where(eq(s3_objects.id, fileId));

    return true;
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      log.error((error as { message: string }).message);
    } else {
      log.error(String(error));
    }
    return false;
  }
}

/**
 * Delete a file from S3 and database by bucket and filename
 */
export async function deleteFileByPath(bucket: string, fileName: string): Promise<boolean> {
  try {
    // Find file in database
    const fileRecord = await database.query.s3_objects.findFirst({
      where: (s3_objects, { and, eq }) => and(eq(s3_objects.bucket, bucket), eq(s3_objects.fileName, fileName)),
    });

    if (fileRecord) {
      // Delete from database
      await database.delete(s3_objects).where(eq(s3_objects.id, fileRecord.id));
    }

    // Delete from S3 (even if not in database)
    await s3Client.removeObject(bucket, fileName);

    return true;
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      log.error((error as { message: string }).message);
    } else {
      log.error(String(error));
    }
    return false;
  }
}

/**
 * List all files uploaded by a specific user
 */
export async function listUserFiles(userId: string) {
  return await database.query.s3_objects.findMany({
    orderBy: (s3_objects, { desc }) => [desc(s3_objects.createdAt)],
    where: eq(s3_objects.created_by, userId),
  });
}
