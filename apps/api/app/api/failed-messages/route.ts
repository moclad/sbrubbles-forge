import { database, desc, isNull } from '@repo/database';
import { failedMessage } from '@repo/database/db/schema';
import { NextResponse } from 'next/server';

export const GET = async (): Promise<Response> => {
  try {
    // Get all unresolved failed messages
    const messages = await database
      .select()
      .from(failedMessage)
      .where(isNull(failedMessage.resolvedAt))
      .orderBy(desc(failedMessage.createdAt));

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
};
