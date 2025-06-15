import { getFiles } from '@repo/storage/server';

// export const { POST } = uploadRouteHandler;

export async function GET(): Promise<Response> {
  console.log('Fetching files from avatar bucket');
  return await getFiles('avatar');
}
