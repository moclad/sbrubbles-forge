'use client';

import type { SelectCategory, SelectPerson } from '@repo/database/db/schema';
import { MiniCalendar, MiniCalendarDay, MiniCalendarDays, MiniCalendarNavigation } from '@repo/design-system/components/kibo-ui/mini-calendar';
import { PageContent } from '@repo/design-system/components/page-content';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/design-system/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '@repo/design-system/components/ui/avatar';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { toast } from '@repo/design-system/components/ui/sonner';
import { useCurrentLocale, useI18n } from '@repo/localization/i18n/client';
import { CalendarRange, Copy, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { ExpenseWithDetails } from '@/lib/expenses-actions';
import { createExpense, deleteExpense, updateExpense } from '@/lib/expenses-actions';
import type { TripWithPeople } from '@/lib/trips-actions';
import { ExpenseFormDialog } from './expense-form-dialog';
import { TripCostSummaryCard } from './trip-cost-summary-card';

type TripDetailsClientProps = {
  categories: SelectCategory[];
  expenses: ExpenseWithDetails[];
  people: SelectPerson[];
  trip: TripWithPeople;
};

const MAX_VISIBLE_AVATARS = 5;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDateRange(startDate: Date, endDate: Date): string {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

function startOfDayValue(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDayValue(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function getTripDurationDays(startDate: Date, endDate: Date): number {
  const start = startOfDayValue(startDate).getTime();
  const end = startOfDayValue(endDate).getTime();
  const dayInMs = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.floor((end - start) / dayInMs) + 1);
}

function formatSelectedDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function subtractOneDay(date: Date): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - 1);
  return result;
}

export function TripDetailsClient({ categories, expenses, people, trip }: Readonly<TripDetailsClientProps>) {
  const t = useI18n();
  const locale = useCurrentLocale();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date>(startOfDayValue(trip.startDate));
  const [calendarStartDate, setCalendarStartDate] = useState<Date>(startOfDayValue(subtractOneDay(trip.startDate)));
  const [createOpen, setCreateOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseWithDetails | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseWithDetails | null>(null);
  const [duplicateSource, setDuplicateSource] = useState<ExpenseWithDetails | null>(null);

  const filteredExpenses = useMemo(
    () => expenses.filter((expense) => isSameDayValue(startOfDayValue(expense.date), startOfDayValue(selectedDate))),
    [expenses, selectedDate]
  );

  const visiblePeople = trip.people.slice(0, MAX_VISIBLE_AVATARS);
  const overflow = Math.max(0, trip.people.length - MAX_VISIBLE_AVATARS);
  const tripDurationDays = getTripDurationDays(trip.startDate, trip.endDate);

  const handleCreate = async (data: {
    amount: number;
    categoryId: string;
    date: Date;
    description: string;
    locationLat: number | null;
    locationLng: number | null;
    locationName: string | null;
    personIds: string[];
  }) => {
    try {
      await createExpense({
        ...data,
        tripId: trip.id,
      });
      toast.success(t('trips.expenses.createSuccess'));
      setCreateOpen(false);
      setDuplicateSource(null);
      router.refresh();
    } catch {
      toast.error(t('trips.expenses.createError'));
    }
  };

  const handleUpdate = async (data: {
    amount: number;
    categoryId: string;
    date: Date;
    description: string;
    locationLat: number | null;
    locationLng: number | null;
    locationName: string | null;
    personIds: string[];
  }) => {
    if (!editingExpense) {
      return;
    }

    try {
      await updateExpense(editingExpense.id, {
        ...data,
        tripId: trip.id,
      });
      toast.success(t('trips.expenses.updateSuccess'));
      setEditingExpense(null);
      router.refresh();
    } catch {
      toast.error(t('trips.expenses.updateError'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteExpense(deleteTarget.id, trip.id);
      toast.success(t('trips.expenses.deleteSuccess'));
      setDeleteTarget(null);
      router.refresh();
    } catch {
      toast.error(t('trips.expenses.deleteError'));
    }
  };

  return (
    <PageContent
      actions={
        <div className='flex items-center gap-2'>
          <Button
            onClick={() => {
              setDuplicateSource(null);
              setCreateOpen(true);
            }}
            size='sm'
          >
            <Plus size={16} />
            {t('trips.expenses.newExpense')}
          </Button>
          <Button asChild size='sm' variant='outline'>
            <Link href={`/${locale}/trips`}>{t('trips.details.backToTrips')}</Link>
          </Button>
        </div>
      }
      header={trip.name}
      subTitle={formatDateRange(trip.startDate, trip.endDate)}
    >
      <div className='space-y-4'>
        {/* Full-width calendar card */}
        <Card>
          <CardHeader className='pb-2'>
            <div className='flex flex-wrap items-center gap-4'>
              <div className='flex items-center gap-1.5 text-muted-foreground text-sm'>
                <CalendarRange size={14} />
                <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
              </div>
              {trip.locationName && (
                <div className='flex items-center gap-1.5 text-muted-foreground text-sm'>
                  <MapPin size={14} />
                  <span className='line-clamp-1'>{trip.locationName}</span>
                </div>
              )}
              {trip.people.length > 0 && (
                <AvatarGroup>
                  {visiblePeople.map((member) => (
                    <Avatar key={member.id} size='sm' title={member.name}>
                      {member.avatarUrl && <AvatarImage alt={member.name} src={member.avatarUrl} />}
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                  ))}
                  {overflow > 0 && <AvatarGroupCount>+{overflow}</AvatarGroupCount>}
                </AvatarGroup>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <MiniCalendar
              className='w-full items-start justify-between'
              days={tripDurationDays + 2}
              onStartDateChange={(date) => {
                if (date) {
                  setCalendarStartDate(date);
                }
              }}
              onValueChange={(date) => {
                if (date) {
                  setSelectedDate(startOfDayValue(date));
                }
              }}
              startDate={calendarStartDate}
              value={selectedDate}
            >
              <MiniCalendarNavigation direction='prev' />
              <MiniCalendarDays className='flex-1 justify-center'>
                {(date) => <MiniCalendarDay date={date} key={date.toISOString()} />}
              </MiniCalendarDays>
              <MiniCalendarNavigation direction='next' />
            </MiniCalendar>
          </CardContent>
        </Card>

        {/* 2 cards side by side */}
        <div className='grid gap-4 lg:grid-cols-2'>
          <TripCostSummaryCard expenses={expenses} />

          <Card>
            <CardHeader>
              <CardTitle>{t('trips.expenses.title')}</CardTitle>
              <p className='text-muted-foreground text-sm'>
                {t('trips.expenses.forDate', {
                  date: formatSelectedDate(selectedDate),
                })}
              </p>
            </CardHeader>
            <CardContent>
              {filteredExpenses.length === 0 ? (
                <div className='rounded-lg border border-dashed py-10 text-center text-muted-foreground text-sm'>
                  {t('trips.expenses.emptyForDate')}
                </div>
              ) : (
                <div className='overflow-hidden rounded-lg border'>
                  <table className='w-full text-sm'>
                    <thead className='border-b bg-muted/50'>
                      <tr>
                        <th className='px-4 py-3 text-left font-medium text-muted-foreground'>{t('trips.expenses.columns.category')}</th>
                        <th className='px-4 py-3 text-left font-medium text-muted-foreground'>{t('trips.expenses.columns.description')}</th>
                        <th className='px-4 py-3 text-left font-medium text-muted-foreground'>{t('trips.expenses.columns.amount')}</th>
                        <th className='px-4 py-3 text-left font-medium text-muted-foreground'>{t('trips.expenses.columns.people')}</th>
                        <th className='px-4 py-3 text-right font-medium text-muted-foreground'>{t('trips.expenses.columns.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((expense) => (
                        <tr className='border-b last:border-0' key={expense.id}>
                          <td className='px-4 py-3'>
                            <Badge
                              className='text-foreground'
                              style={{
                                backgroundColor: `${expense.category.color}22`,
                                borderColor: expense.category.color,
                              }}
                              variant='outline'
                            >
                              {expense.category.name}
                            </Badge>
                          </td>
                          <td className='px-4 py-3'>
                            <div className='space-y-1'>
                              <p className='font-medium'>{expense.description}</p>
                              {expense.locationName && <p className='line-clamp-1 text-muted-foreground text-xs'>{expense.locationName}</p>}
                            </div>
                          </td>
                          <td className='px-4 py-3 font-medium'>{expense.amount.toFixed(2)}</td>
                          <td className='px-4 py-3'>{expense.people.length === 0 ? '-' : expense.people.map((person) => person.name).join(', ')}</td>
                          <td className='px-4 py-3'>
                            <div className='flex justify-end gap-1'>
                              <Button className='h-7 w-7' onClick={() => setEditingExpense(expense)} size='icon' variant='ghost'>
                                <Pencil size={14} />
                              </Button>
                              <Button
                                className='h-7 w-7'
                                onClick={() => {
                                  setDuplicateSource(expense);
                                  setCreateOpen(true);
                                }}
                                size='icon'
                                variant='ghost'
                              >
                                <Copy size={14} />
                              </Button>
                              <Button
                                className='h-7 w-7 text-destructive hover:text-destructive'
                                onClick={() => setDeleteTarget(expense)}
                                size='icon'
                                variant='ghost'
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ExpenseFormDialog
        categories={categories}
        initialData={
          duplicateSource
            ? {
                ...duplicateSource,
                date: selectedDate,
              }
            : undefined
        }
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setDuplicateSource(null);
          }
        }}
        onSubmit={handleCreate}
        open={createOpen}
        people={people}
        selectedDate={selectedDate}
        trip={trip}
      />

      <ExpenseFormDialog
        categories={categories}
        initialData={editingExpense ?? undefined}
        onOpenChange={(open) => {
          if (!open) {
            setEditingExpense(null);
          }
        }}
        onSubmit={handleUpdate}
        open={Boolean(editingExpense)}
        people={people}
        selectedDate={selectedDate}
        trip={trip}
      />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        open={Boolean(deleteTarget)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('trips.expenses.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('trips.expenses.deleteDialog.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('trips.expenses.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction className='bg-destructive text-destructive-foreground hover:bg-destructive/90' onClick={handleDelete}>
              {t('trips.expenses.deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContent>
  );
}
