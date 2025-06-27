'use server';

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { getAvatarUploadUrl } from '@repo/storage/actions/user-avatar';

import { auth } from '../server';

export async function uploadAvatar(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
      },
      { status: 401 }
    );
  }

  const body = Object.fromEntries(formData);
  const file = (body.file as Blob) || null;
  const extension = (body.extension as string) || 'png';
  const userId = session.user.id;

  const url = await getAvatarUploadUrl(userId, extension);

  const res = await fetch(url.signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });
  //     await updateUser({ image: res.url });

  //  console.log(await uploadUserAvatar(userId, file));
  // } else {
  //   return NextResponse.json({
  //     success: false,
  //   });
  // }

  return NextResponse.json({
    success: true,
    name: (body.file as File).name,
  });
}
