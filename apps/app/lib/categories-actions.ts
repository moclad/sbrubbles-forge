'use server';

import { auth } from '@repo/auth/server';
import { asc, database, eq } from '@repo/database';
import { category } from '@repo/database/db/schema';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

type CategoryData = {
  name: string;
  description?: string;
  icon: string;
  color: string;
};

export async function getCategories() {
  await requireSession();
  return database.select().from(category).orderBy(asc(category.name));
}

export async function createCategory(data: CategoryData) {
  await requireSession();
  await database.insert(category).values({
    color: data.color,
    description: data.description ?? null,
    icon: data.icon,
    name: data.name,
  });
  revalidatePath('/settings/categories');
}

export async function updateCategory(id: string, data: CategoryData) {
  await requireSession();
  await database
    .update(category)
    .set({
      color: data.color,
      description: data.description ?? null,
      icon: data.icon,
      name: data.name,
      updatedAt: new Date(),
    })
    .where(eq(category.id, id));
  revalidatePath('/settings/categories');
}

export async function deleteCategory(id: string) {
  await requireSession();
  await database.delete(category).where(eq(category.id, id));
  revalidatePath('/settings/categories');
}
