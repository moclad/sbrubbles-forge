import { nanoid } from 'nanoid';
import type { NextApiRequest, NextApiResponse } from 'next';
import { keys } from '../keys';
import { createPresignedUrlToUpload } from '../s3-file-management';
import type { PresignedUrlProp, ShortFileProp } from '../types';

const bucketName = keys().S3_BUCKET_NAME ?? 'default-bucket';
const expiry = 60 * 60; // 1 hour

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests are allowed' });
    return;
  }
  // get the files from the request body
  const files = req.body as ShortFileProp[];

  if (!files?.length) {
    res.status(400).json({ message: 'No files to upload' });
    return;
  }

  const presignedUrls = [] as PresignedUrlProp[];

  if (files?.length) {
    // use Promise.all to get all the presigned urls in parallel
    await Promise.all(
      // loop through the files
      files.map(async (file) => {
        const fileName = `${nanoid(5)}-${file?.originalFileName}`;

        // get presigned url using s3 sdk
        const url = await createPresignedUrlToUpload({
          bucketName,
          expiry,
          fileName,
        });
        // add presigned url to the list
        presignedUrls.push({
          fileNameInBucket: fileName,
          fileSize: file.fileSize,
          originalFileName: file.originalFileName,
          url,
        });
      })
    );
  }

  res.status(200).json(presignedUrls);
}
