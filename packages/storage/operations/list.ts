import { database, desc } from '@repo/database';
import { s3_objects } from '@repo/database/db/schema';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { FileProps } from '../types';

const LIMIT_FILES = 10;

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  console.log(_req, res);

  const files = await database
    .select()
    .from(s3_objects)
    .limit(LIMIT_FILES)
    .orderBy(desc(s3_objects.createdAt));

  // The database type is a bit different from the frontend type
  // Make the array of files compatible with the frontend type FileProps
  const filesWithProps: FileProps[] = files.map((file) => ({
    fileSize: file.fileSize ?? 0,
    id: file.id,
    originalFileName: file.originalFileName,
  }));

  return res.status(200).json(filesWithProps);
};

export default handler;
