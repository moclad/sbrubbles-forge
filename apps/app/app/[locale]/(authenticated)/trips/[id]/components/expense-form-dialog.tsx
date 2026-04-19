'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { SelectCategory, SelectPerson } from '@repo/database/db/schema';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import { DateTimePicker } from '@repo/design-system/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { useI18n } from '@repo/localization/i18n/client';
import { Euro, Loader2, Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ExpenseWithDetails } from '@/lib/expenses-actions';
import type { TripWithPeople } from '@/lib/trips-actions';

const LocationMap = dynamic(() => import('../../components/location-map').then((m) => m.LocationMap), { ssr: false });

type LocationState = {
  lat: number;
  lng: number;
  name: string;
};

type ExpenseFormValues = {
  amount: string;
  categoryId: string;
  date: string;
  description?: string;
  locationQuery?: string;
  personIds: string[];
};

type ExpenseFormDialogProps = {
  categories: SelectCategory[];
  initialData?: ExpenseWithDetails;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    amount: number;
    categoryId: string;
    date: Date;
    description: string;
    locationLat: number | null;
    locationLng: number | null;
    locationName: string | null;
    personIds: string[];
  }) => Promise<void>;
  open: boolean;
  people: SelectPerson[];
  selectedDate: Date;
  trip: TripWithPeople;
};

function toDateInputValue(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDefaultLocation(trip: TripWithPeople, initialData?: ExpenseWithDetails): LocationState | null {
  if (initialData?.locationLat != null && initialData.locationLng != null) {
    return {
      lat: initialData.locationLat,
      lng: initialData.locationLng,
      name: initialData.locationName ?? '',
    };
  }

  if (trip.locationLat != null && trip.locationLng != null) {
    return {
      lat: trip.locationLat,
      lng: trip.locationLng,
      name: trip.locationName ?? '',
    };
  }

  return null;
}

export function ExpenseFormDialog({
  categories,
  initialData,
  onOpenChange,
  onSubmit,
  open,
  people,
  selectedDate,
  trip,
}: Readonly<ExpenseFormDialogProps>) {
  const t = useI18n();
  const isEdit = Boolean(initialData);
  const [searching, setSearching] = useState(false);
  const [locationNotFound, setLocationNotFound] = useState(false);
  const [location, setLocation] = useState<LocationState | null>(() => getDefaultLocation(trip, initialData));

  const schema = z.object({
    amount: z.string().min(1, t('trips.expenses.form.errors.amountRequired')),
    categoryId: z.string().min(1, t('trips.expenses.form.errors.categoryRequired')),
    date: z.string().min(1, t('trips.expenses.form.errors.dateRequired')),
    description: z.string().max(255).optional(),
    locationQuery: z.string().optional(),
    personIds: z.array(z.string()),
  });

  const form = useForm<ExpenseFormValues>({
    defaultValues: {
      amount: initialData ? String(initialData.amount) : '',
      categoryId: initialData?.category.id ?? '',
      date: toDateInputValue(initialData?.date ?? selectedDate),
      description: initialData?.description ?? '',
      locationQuery: initialData?.locationName ?? trip.locationName ?? '',
      personIds: initialData?.people.map((item) => item.id) ?? [],
    },
    resolver: zodResolver(schema),
  });

  const selectedCategory = useMemo(() => {
    const categoryId = form.watch('categoryId');
    return categories.find((category) => category.id === categoryId) ?? null;
  }, [categories, form]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialData) {
      form.reset({
        amount: String(initialData.amount),
        categoryId: initialData.category.id,
        date: toDateInputValue(initialData.date),
        description: initialData.description ?? '',
        locationQuery: initialData.locationName ?? trip.locationName ?? '',
        personIds: initialData.people.map((item) => item.id),
      });
      setLocation(getDefaultLocation(trip, initialData));
    } else {
      form.setValue('date', toDateInputValue(selectedDate));
    }
  }, [form, initialData, open, selectedDate, trip]);

  const resetForm = () => {
    form.reset({
      amount: initialData ? String(initialData.amount) : '',
      categoryId: initialData?.category.id ?? '',
      date: toDateInputValue(initialData?.date ?? selectedDate),
      description: initialData?.description ?? '',
      locationQuery: initialData?.locationName ?? trip.locationName ?? '',
      personIds: initialData?.people.map((item) => item.id) ?? [],
    });
    setLocation(getDefaultLocation(trip, initialData));
    setLocationNotFound(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSearch = async () => {
    const query = form.getValues('locationQuery');
    if (!query?.trim()) {
      return;
    }

    setSearching(true);
    setLocationNotFound(false);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        {
          headers: { 'Accept-Language': 'en' },
        }
      );
      const data = (await response.json()) as {
        display_name: string;
        lat: string;
        lon: string;
      }[];

      if (data.length === 0) {
        setLocationNotFound(true);
        setLocation(null);
        return;
      }

      setLocation({
        lat: Number.parseFloat(data[0].lat),
        lng: Number.parseFloat(data[0].lon),
        name: data[0].display_name,
      });
      setLocationNotFound(false);
    } catch {
      setLocationNotFound(true);
      setLocation(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (values: ExpenseFormValues) => {
    const parsedAmount = Number.parseFloat(values.amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      form.setError('amount', {
        message: t('trips.expenses.form.errors.invalidAmount'),
        type: 'validate',
      });
      return;
    }

    const parsedDate = new Date(`${values.date}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      form.setError('date', {
        message: t('trips.expenses.form.errors.invalidDate'),
        type: 'validate',
      });
      return;
    }

    await onSubmit({
      amount: parsedAmount,
      categoryId: values.categoryId,
      date: parsedDate,
      description: values.description ?? '',
      locationLat: location?.lat ?? null,
      locationLng: location?.lng ?? null,
      locationName: location?.name ?? null,
      personIds: values.personIds,
    });

    resetForm();
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg lg:max-w-xl'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('trips.expenses.form.editTitle') : t('trips.expenses.form.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className='flex flex-col gap-4' onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name='categoryId'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-2'>
                  <FormLabel>{t('trips.expenses.form.categoryLabel')}</FormLabel>
                  {selectedCategory && (
                    <Badge
                      className='w-fit text-foreground'
                      style={{
                        backgroundColor: `${selectedCategory.color}33`,
                        borderColor: selectedCategory.color,
                      }}
                      variant='outline'
                    >
                      {selectedCategory.name}
                    </Badge>
                  )}
                  <FormControl>
                    <div className='flex flex-wrap gap-2'>
                      {categories.map((category) => {
                        const isSelected = field.value === category.id;
                        return (
                          <button
                            className='cursor-pointer border-0 bg-transparent p-0'
                            key={category.id}
                            onClick={() => field.onChange(category.id)}
                            type='button'
                          >
                            <Badge
                              className='pointer-events-none text-foreground transition-opacity hover:opacity-90'
                              style={{
                                backgroundColor: isSelected ? `${category.color}44` : `${category.color}18`,
                                borderColor: category.color,
                                boxShadow: isSelected ? `0 0 0 2px ${category.color}` : 'none',
                              }}
                              variant='outline'
                            >
                              {category.name}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('trips.expenses.form.amountLabel')}</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Euro className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                      <Input className='pl-9' min='0' placeholder='0.00' step='0.01' type='number' {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='date'
              render={({ field }) => {
                return (
                  <FormItem className='flex flex-col'>
                    <FormLabel>{t('trips.expenses.form.dateLabel')}</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        displayFormat={{ hour24: 'dd MMM yyyy' }}
                        granularity='day'
                        onChange={(day) => {
                          if (day) {
                            field.onChange(day);
                          }
                        }}
                        value={field.value ? new Date(field.value) : undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('trips.expenses.form.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('trips.expenses.form.descriptionPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='locationQuery'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('trips.expenses.form.locationLabel')}</FormLabel>
                  <div className='flex gap-2'>
                    <FormControl>
                      <Input
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            handleSearch();
                          }
                        }}
                        placeholder={t('trips.expenses.form.locationPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <Button disabled={searching} onClick={handleSearch} type='button' variant='outline'>
                      {searching ? <Loader2 className='animate-spin' size={14} /> : <Search size={14} />}
                      {t('trips.expenses.form.searchButton')}
                    </Button>
                  </div>
                  {locationNotFound && (
                    <p className='text-destructive text-sm'>{t('trips.expenses.form.locationNotFound')}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {location ? (
              <>
                <LocationMap
                  lat={location.lat}
                  lng={location.lng}
                  locationName={location.name}
                  onPositionChange={(lat, lng) => {
                    setLocation((previous) => (previous ? { ...previous, lat, lng } : null));
                  }}
                />
                <p className='text-muted-foreground text-xs'>{t('trips.form.locationMarkerHint')}</p>
              </>
            ) : (
              <p className='text-muted-foreground text-xs'>{t('trips.expenses.form.locationOptionalHint')}</p>
            )}

            {people.length > 0 && (
              <FormField
                control={form.control}
                name='personIds'
                render={() => (
                  <FormItem>
                    <FormLabel>{t('trips.expenses.form.peopleLabel')}</FormLabel>
                    <div className='flex flex-col gap-2'>
                      {people.map((item) => (
                        <FormField
                          control={form.control}
                          key={item.id}
                          name='personIds'
                          render={({ field }) => (
                            <FormItem className='flex items-center gap-2 space-y-0'>
                              <FormControl>
                                <Checkbox
                                  checked={field.value.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    const next = checked
                                      ? [...field.value, item.id]
                                      : field.value.filter((value) => value !== item.id);
                                    field.onChange(next);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className='cursor-pointer font-normal'>{item.name}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)} variant='outline'>
                {t('trips.expenses.form.cancel')}
              </Button>
              <Button type='submit'>
                {isEdit ? t('trips.expenses.form.saveChanges') : t('trips.expenses.form.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
