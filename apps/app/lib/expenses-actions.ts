'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { auth } from '@repo/auth/server';
import { database, desc, eq, inArray } from '@repo/database';
import { category, expense, expensePerson, person, tripPerson } from '@repo/database/db/schema';

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

export type ExpenseData = {
  amount: number;
  categoryId: string;
  date: Date;
  description: string;
  locationLat?: number | null;
  locationLng?: number | null;
  locationName?: string | null;
  personIds?: string[];
  tripId: string;
};

export type ExpenseWithDetails = {
  amount: number;
  category: {
    color: string;
    icon: string;
    id: string;
    name: string;
  };
  createdAt: Date;
  date: Date;
  description: string | null;
  id: string;
  locationLat: number | null;
  locationLng: number | null;
  locationName: string | null;
  people: {
    avatarUrl: string | null;
    id: string;
    name: string;
  }[];
  tripId: string;
  updatedAt: Date;
};

function sanitizePersonIds(personIds: string[] | undefined): string[] {
  if (!personIds || personIds.length === 0) {
    return [];
  }
  return [...new Set(personIds)];
}

async function assertPeopleBelongToTrip(tripId: string, personIds: string[]) {
  if (personIds.length === 0) {
    return;
  }

  const rows = await database
    .select({ personId: tripPerson.personId })
    .from(tripPerson)
    .where(eq(tripPerson.tripId, tripId));

  const validPeopleForTrip = new Set(rows.filter((row) => row.personId).map((row) => row.personId));

  const hasInvalidPerson = personIds.some((personId) => !validPeopleForTrip.has(personId));

  if (hasInvalidPerson) {
    throw new Error('Invalid people selection for this trip');
  }
}

function validateExpenseInput(data: ExpenseData) {
  if (!data.tripId.trim()) {
    throw new Error('Trip id is required');
  }
  if (!data.categoryId.trim()) {
    throw new Error('Category is required');
  }
  if (!Number.isFinite(data.amount) || data.amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }
  if (!(data.date instanceof Date) || Number.isNaN(data.date.getTime())) {
    throw new Error('Invalid expense date');
  }
}

export async function getExpensesByTrip(tripId: string): Promise<ExpenseWithDetails[]> {
  await requireSession();

  const expenseRows = await database
    .select({
      amount: expense.amount,
      categoryColor: category.color,
      categoryIcon: category.icon,
      categoryId: category.id,
      categoryName: category.name,
      createdAt: expense.createdAt,
      date: expense.expenseDate,
      description: expense.description,
      id: expense.id,
      locationLat: expense.locationLat,
      locationLng: expense.locationLng,
      locationName: expense.locationName,
      tripId: expense.tripId,
      updatedAt: expense.updatedAt,
    })
    .from(expense)
    .innerJoin(category, eq(expense.categoryId, category.id))
    .where(eq(expense.tripId, tripId))
    .orderBy(desc(expense.expenseDate), desc(expense.createdAt));

  if (expenseRows.length === 0) {
    return [];
  }

  const expenseIds = expenseRows.map((row) => row.id);
  const peopleRows = await database
    .select({
      avatarUrl: person.avatarUrl,
      expenseId: expensePerson.expenseId,
      id: person.id,
      name: person.name,
    })
    .from(expensePerson)
    .innerJoin(person, eq(expensePerson.personId, person.id))
    .where(
      expenseIds.length === 1
        ? eq(expensePerson.expenseId, expenseIds[0])
        : inArray(expensePerson.expenseId, expenseIds)
    );

  const peopleByExpense = new Map<string, { avatarUrl: string | null; id: string; name: string }[]>();

  for (const row of peopleRows) {
    const list = peopleByExpense.get(row.expenseId) ?? [];
    list.push({
      avatarUrl: row.avatarUrl,
      id: row.id,
      name: row.name,
    });
    peopleByExpense.set(row.expenseId, list);
  }

  return expenseRows.map((row) => ({
    amount: row.amount,
    category: {
      color: row.categoryColor,
      icon: row.categoryIcon,
      id: row.categoryId,
      name: row.categoryName,
    },
    createdAt: row.createdAt,
    date: row.date,
    description: row.description,
    id: row.id,
    locationLat: row.locationLat,
    locationLng: row.locationLng,
    locationName: row.locationName,
    people: peopleByExpense.get(row.id) ?? [],
    tripId: row.tripId,
    updatedAt: row.updatedAt,
  }));
}

export async function createExpense(data: ExpenseData) {
  await requireSession();
  validateExpenseInput(data);

  const personIds = sanitizePersonIds(data.personIds);
  await assertPeopleBelongToTrip(data.tripId, personIds);

  const [created] = await database
    .insert(expense)
    .values({
      amount: data.amount,
      categoryId: data.categoryId,
      description: data.description.trim(),
      expenseDate: data.date,
      locationLat: data.locationLat ?? null,
      locationLng: data.locationLng ?? null,
      locationName: data.locationName?.trim() ? data.locationName : null,
      tripId: data.tripId,
    })
    .returning();

  if (personIds.length > 0) {
    await database.insert(expensePerson).values(personIds.map((personId) => ({ expenseId: created.id, personId })));
  }

  revalidatePath('/trips');
  revalidatePath(`/trips/${data.tripId}`);

  return created;
}

export async function updateExpense(id: string, data: ExpenseData) {
  await requireSession();
  validateExpenseInput(data);

  const personIds = sanitizePersonIds(data.personIds);
  await assertPeopleBelongToTrip(data.tripId, personIds);

  await database
    .update(expense)
    .set({
      amount: data.amount,
      categoryId: data.categoryId,
      description: data.description.trim(),
      expenseDate: data.date,
      locationLat: data.locationLat ?? null,
      locationLng: data.locationLng ?? null,
      locationName: data.locationName?.trim() ? data.locationName : null,
      updatedAt: new Date(),
    })
    .where(eq(expense.id, id));

  await database.delete(expensePerson).where(eq(expensePerson.expenseId, id));

  if (personIds.length > 0) {
    await database.insert(expensePerson).values(personIds.map((personId) => ({ expenseId: id, personId })));
  }

  revalidatePath('/trips');
  revalidatePath(`/trips/${data.tripId}`);
}

export async function deleteExpense(id: string, tripId: string) {
  await requireSession();

  await database.delete(expense).where(eq(expense.id, id));

  revalidatePath('/trips');
  revalidatePath(`/trips/${tripId}`);
}
