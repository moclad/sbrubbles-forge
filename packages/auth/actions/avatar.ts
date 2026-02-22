'use server';

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { auth } from '../server';

export async function uploadAvatar(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        success: false,
      },
      { status: 401 }
    );
  }

  const body = Object.fromEntries(formData);
  const file = (body.file as Blob) || null;
  const extension = (body.extension as string) || 'png';
  const userId = session.user.id;

  //     await updateUser({ image: res.url });

  //  console.log(await uploadUserAvatar(userId, file));
  // } else {
  //   return NextResponse.json({
  //     success: false,
  //   });
  // }

  return NextResponse.json({
    name: (body.file as File).name,
    success: true,
  });
}
