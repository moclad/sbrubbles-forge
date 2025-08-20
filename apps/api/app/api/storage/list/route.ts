import { getAvatarUploadUrl } from '@repo/storage/avatar';
import { NextResponse } from 'next/server';

export const GET = async () => {
  const url = await getAvatarUploadUrl('', 'user-id', 'png');
  return NextResponse.json({ url });
};
