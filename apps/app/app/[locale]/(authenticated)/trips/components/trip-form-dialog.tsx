'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { SelectPerson } from '@repo/database/db/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components/ui/avatar';
import { Button } from '@repo/design-system/components/ui/button';
import { CalendarDatePicker } from '@repo/design-system/components/ui/calendar-date-picker';
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
import { Loader2, Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getInitials } from '@/lib/format-utils';
import type { TripData } from '@/lib/trips-actions';

const LocationMap = dynamic(() => import('./location-map').then((m) => m.LocationMap), { ssr: false });

type TripFormValues = {
  name: string;
  locationQuery?: string;
  personIds: string[];
};

type LocationResult = {
  name: string;
  lat: number;
  lng: number;
};

type TripFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    locationName: string | null;
    locationLat: number | null;
    locationLng: number | null;
    people: { id: string }[];
  };
  people: SelectPerson[];
  onSubmit: (data: TripData) => Promise<void>;
};

export function TripFormDialog({ open, onOpenChange, initialData, people, onSubmit }: Readonly<TripFormDialogProps>) {
  const t = useI18n();
  const isEdit = Boolean(initialData);

  const [location, setLocation] = useState<LocationResult | null>(
    initialData?.locationLat != null && initialData?.locationLng != null
      ? {
          lat: initialData.locationLat,
          lng: initialData.locationLng,
          name: initialData.locationName ?? '',
        }
      : null
  );
  const [searching, setSearching] = useState(false);
  const [locationNotFound, setLocationNotFound] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(
    initialData ? { from: initialData.startDate, to: initialData.endDate } : null
  );

  const schema = z.object({
    locationQuery: z.string().optional(),
    name: z.string().min(1, t('trips.form.errors.nameRequired')).max(255),
    personIds: z.array(z.string()),
  });

  const form = useForm<TripFormValues>({
    defaultValues: {
      locationQuery: initialData?.locationName ?? '',
      name: initialData?.name ?? '',
      personIds: initialData?.people.map((p) => p.id) ?? [],
    },
    resolver: zodResolver(schema),
  });

  const handleSearch = async () => {
    const query = form.getValues('locationQuery');
    if (!query?.trim()) {
      return;
    }
    setSearching(true);
    setLocationNotFound(false);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        {
          headers: { 'Accept-Language': 'en' },
        }
      );
      const data = (await res.json()) as {
        lat: string;
        lon: string;
        display_name: string;
      }[];
      if (data.length === 0) {
        setLocationNotFound(true);
        setLocation(null);
      } else {
        setLocation({
          lat: Number.parseFloat(data[0].lat),
          lng: Number.parseFloat(data[0].lon),
          name: data[0].display_name,
        });
        setLocationNotFound(false);
      }
    } catch {
      setLocationNotFound(true);
      setLocation(null);
    } finally {
      setSearching(false);
    }
  };

  const handleDateSelect = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    setDateError(null);
  };

  const handleSubmit = async (values: TripFormValues) => {
    if (!dateRange) {
      setDateError(t('trips.form.errors.startDateRequired'));
      return;
    }
    await onSubmit({
      endDate: dateRange.to,
      locationLat: location?.lat ?? null,
      locationLng: location?.lng ?? null,
      locationName: location?.name ?? null,
      name: values.name,
      personIds: values.personIds,
      startDate: dateRange.from,
    });
    form.reset();
    setDateRange(null);
    setDateError(null);
    setLocation(null);
    setLocationNotFound(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset();
      setDateRange(initialData ? { from: initialData.startDate, to: initialData.endDate } : null);
      setDateError(null);
      setLocation(
        initialData?.locationLat != null && initialData?.locationLng != null
          ? {
              lat: initialData.locationLat,
              lng: initialData.locationLng,
              name: initialData.locationName ?? '',
            }
          : null
      );
      setLocationNotFound(false);
    }
    onOpenChange(next);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg lg:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{isEdit ? t('trips.form.editTitle') : t('trips.form.createTitle')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className='flex flex-col gap-4' onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Name */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('trips.form.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('trips.form.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
            <FormItem>
              <FormLabel>{t('trips.form.datesLabel')}</FormLabel>
              <CalendarDatePicker
                className='w-full justify-start'
                closeOnSelect={false}
                date={{
                  from: dateRange?.from,
                  to: dateRange?.to,
                }}
                numberOfMonths={2}
                onDateSelect={handleDateSelect}
                variant='outline'
              />
              {dateError && <p className='text-destructive text-sm'>{dateError}</p>}
            </FormItem>

            {/* Location */}
            <FormField
              control={form.control}
              name='locationQuery'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('trips.form.locationLabel')}</FormLabel>
                  <div className='flex gap-2'>
                    <FormControl>
                      <Input
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearch();
                          }
                        }}
                        placeholder={t('trips.form.locationPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <Button disabled={searching} onClick={handleSearch} size='default' type='button' variant='outline'>
                      {searching ? <Loader2 className='animate-spin' size={14} /> : <Search size={14} />}
                      {t('trips.form.searchButton')}
                    </Button>
                  </div>
                  {locationNotFound && <p className='text-destructive text-sm'>{t('trips.form.locationNotFound')}</p>}
                  <FormMessage />
                </FormItem>
              )}
            />

            {location && (
              <>
                <LocationMap
                  lat={location.lat}
                  lng={location.lng}
                  locationName={location.name}
                  onPositionChange={(lat, lng) => setLocation((prev) => (prev ? { ...prev, lat, lng } : null))}
                />
                <p className='text-muted-foreground text-xs'>{t('trips.form.locationMarkerHint')}</p>
              </>
            )}

            {/* People */}
            {people.length > 0 && (
              <FormField
                control={form.control}
                name='personIds'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('trips.form.peopleLabel')}</FormLabel>
                    <FormControl>
                      <div className='flex flex-wrap gap-2'>
                        {people.map((item) => {
                          const isSelected = field.value.includes(item.id);
                          return (
                            <button
                              aria-label={item.name}
                              className={`cursor-pointer rounded-full border-2 p-0 outline-none ring-offset-background transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                                isSelected
                                  ? 'scale-105 border-ring opacity-100 shadow-[0_0_0_2px_hsl(var(--background))]'
                                  : 'scale-100 border-transparent opacity-70'
                              }`}
                              key={item.id}
                              onClick={() => {
                                const next = isSelected
                                  ? field.value.filter((value) => value !== item.id)
                                  : [...field.value, item.id];
                                field.onChange(next);
                              }}
                              title={item.name}
                              type='button'
                            >
                              <Avatar size='lg'>
                                <AvatarImage alt={item.name} src={item.avatarUrl ?? undefined} />
                                <AvatarFallback>{getInitials(item.name)}</AvatarFallback>
                              </Avatar>
                            </button>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)} type='button' variant='outline'>
                {t('trips.form.cancel')}
              </Button>
              <Button type='submit'>{isEdit ? t('trips.form.saveChanges') : t('trips.form.create')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
