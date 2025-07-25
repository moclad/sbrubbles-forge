import handler from '@repo/storage/operations/list';
import { NextApiRequest, NextApiResponse } from 'next';

export const GET = async (req: NextApiRequest, res: NextApiResponse) =>
  await handler(req, res);
