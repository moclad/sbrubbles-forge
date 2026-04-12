'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { SelectPerson } from '@repo/database/db/schema';
import { Button } from '@repo/design-system/components/ui/button';
import { CalendarDatePicker } from '@repo/design-system/components/ui/calendar-date-picker';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { useI18n } from '@repo/localization/i18n/client';
import { Loader2, Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { TripData } from '@/lib/trips-actions';

const LocationMap = dynamic(
  () => import('./location-map').then((m) => m.LocationMap),
  { ssr: false }
);

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

export function TripFormDialog({
  open,
  onOpenChange,
  initialData,
  people,
  onSubmit,
}: Readonly<TripFormDialogProps>) {
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
    initialData
      ? { from: initialData.startDate, to: initialData.endDate }
      : null
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
        { headers: { 'Accept-Language': 'en' } }
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
      setDateRange(
        initialData
          ? { from: initialData.startDate, to: initialData.endDate }
          : null
      );
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
          <DialogTitle>
            {isEdit ? t('trips.form.editTitle') : t('trips.form.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className='flex flex-col gap-4'
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            {/* Name */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('trips.form.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('trips.form.namePlaceholder')}
                      {...field}
                    />
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
              {dateError && (
                <p className='text-destructive text-sm'>{dateError}</p>
              )}
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
                    <Button
                      disabled={searching}
                      onClick={handleSearch}
                      size='default'
                      type='button'
                      variant='outline'
                    >
                      {searching ? (
                        <Loader2 className='animate-spin' size={14} />
                      ) : (
                        <Search size={14} />
                      )}
                      {t('trips.form.searchButton')}
                    </Button>
                  </div>
                  {locationNotFound && (
                    <p className='text-destructive text-sm'>
                      {t('trips.form.locationNotFound')}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {location && (
              <LocationMap
                lat={location.lat}
                lng={location.lng}
                locationName={location.name}
              />
            )}

            {/* People */}
            {people.length > 0 && (
              <FormField
                control={form.control}
                name='personIds'
                render={() => (
                  <FormItem>
                    <FormLabel>{t('trips.form.peopleLabel')}</FormLabel>
                    <div className='flex flex-col gap-2'>
                      {people.map((p) => (
                        <FormField
                          control={form.control}
                          key={p.id}
                          name='personIds'
                          render={({ field }) => (
                            <FormItem className='flex items-center gap-2 space-y-0'>
                              <FormControl>
                                <Checkbox
                                  checked={field.value.includes(p.id)}
                                  onCheckedChange={(checked) => {
                                    const next = checked
                                      ? [...field.value, p.id]
                                      : field.value.filter((v) => v !== p.id);
                                    field.onChange(next);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className='cursor-pointer font-normal'>
                                {p.name}
                              </FormLabel>
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
              <Button
                onClick={() => handleOpenChange(false)}
                type='button'
                variant='outline'
              >
                {t('trips.form.cancel')}
              </Button>
              <Button type='submit'>
                {isEdit ? t('trips.form.saveChanges') : t('trips.form.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
