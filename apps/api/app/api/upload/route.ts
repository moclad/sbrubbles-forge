import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@repo/auth/server';
import { getFiles, uploadAvatar } from '@repo/storage/server';

export async function GET(): Promise<Response> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return await getFiles('public-assets');
}

export async function POST(req: NextRequest, res: NextResponse) {
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

  const formData = await req.formData();
  const body = Object.fromEntries(formData);
  const file = (body.file as Blob) || null;
  const userId = session.user.id;

  if (file) {
    await uploadAvatar(userId, file);
  } else {
    return NextResponse.json({
      success: false,
    });
  }

  return NextResponse.json({
    success: true,
    name: (body.file as File).name,
  });
}
