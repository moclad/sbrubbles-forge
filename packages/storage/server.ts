import { createUploadRouteHandler, route } from 'better-upload/server';
import { NextResponse } from 'next/server';

import {
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { keys } from './keys';

import type { NextApiRequest, NextApiResponse } from 'next';
export const s3Client = new S3Client({
  region: keys().S3_REGION || 'us-east-1',
  endpoint: keys().S3_ENDPOINT || 'http://localhost:8333',
  credentials: {
    accessKeyId: keys().S3_ACCESS_KEY_ID || 'your-access-key',
    secretAccessKey: keys().S3_SECRET_ACCESS_KEY || 'your-secret-key',
  },
  forcePathStyle: true, // Needed for S3-compatible services
});

export const uploadRouteHandler = createUploadRouteHandler({
  client: s3Client,
  bucketName: 'avatar',
  routes: {
    upload: route({
      fileTypes: ['image/*'],
    }),
  },
});

export async function getFiles(bucket: string) {
  const response = await s3Client.send(
    new ListObjectsCommand({ Bucket: bucket })
  );
  console.log('Files in bucket:', response);

  return NextResponse.json(response?.Contents ?? []);
}

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query;
  const key = Array.isArray(filename) ? filename[0] : filename;

  if (!key) {
    res.status(400).json({ error: 'Filename is required' });
    return;
  }

  const command = new PutObjectCommand({
    Bucket: 'your-bucket',
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  res.status(200).json({ url });
}
