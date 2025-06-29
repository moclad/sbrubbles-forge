import { auth } from '@repo/auth/server';
import {
  getAvatarUrl,
  uploadUserAvatar,
} from '@repo/storage/actions/user-avatar';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(): Promise<Response> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
      },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  return NextResponse.json(await getAvatarUrl(userId));
}

export async function POST(req: NextRequest, _res: NextResponse) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
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
    await uploadUserAvatar(userId, file);
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
