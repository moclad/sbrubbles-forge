'use client';

import type { SelectPerson } from '@repo/database/db/schema';
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
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@repo/design-system/components/ui/avatar';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { toast } from '@repo/design-system/components/ui/sonner';
import { useCurrentLocale, useI18n } from '@repo/localization/i18n/client';
import { Banknote, CalendarRange, Camera, ImageIcon, Loader2, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { formatCurrency } from '@/lib/currency-utils';
import { formatDateRange, getInitials, MAX_VISIBLE_AVATARS } from '@/lib/format-utils';
import type { TripData, TripWithPeople } from '@/lib/trips-actions';
import { createTrip, deleteTrip, updateTrip, uploadTripCoverPhoto } from '@/lib/trips-actions';
import { TripFormDialog } from './trip-form-dialog';

type TripsTableProps = {
  currency: string;
  trips: TripWithPeople[];
  people: SelectPerson[];
};

type TripCardProps = {
  currency: string;
  locale: string;
  onOpen: (id: string) => void;
  trip: TripWithPeople;
  onEdit: (trip: TripWithPeople) => void;
  onDelete: (id: string) => void;
};

function TripCard({ currency, locale, onOpen, trip, onEdit, onDelete }: Readonly<TripCardProps>) {
  const t = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(trip.coverPhotoUrl);

  const visiblePeople = trip.people.slice(0, MAX_VISIBLE_AVATARS);
  const overflow = trip.people.length - MAX_VISIBLE_AVATARS;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    // optimistic preview
    const preview = URL.createObjectURL(file);
    setPhotoUrl(preview);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const url = await uploadTripCoverPhoto(trip.id, formData);
      URL.revokeObjectURL(preview);
      setPhotoUrl(url);
      toast.success(t('trips.photoUploadSuccess'));
    } catch {
      URL.revokeObjectURL(preview);
      setPhotoUrl(trip.coverPhotoUrl);
      toast.error(t('trips.photoUploadError'));
    } finally {
      setUploading(false);
      // reset so same file can be re-selected
      e.target.value = '';
    }
  };

  return (
    <Card
      className='flex cursor-pointer flex-col overflow-hidden'
      onClick={() => onOpen(trip.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(trip.id);
        }
      }}
      role='button'
      tabIndex={0}
    >
      {/* Cover photo */}
      <div className='relative aspect-video bg-muted'>
        {photoUrl ? (
          <Image alt={trip.name} className='object-cover' fill sizes='(max-width: 768px) 100vw, 50vw' src={photoUrl} />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <ImageIcon className='text-muted-foreground/30' size={40} />
          </div>
        )}
        <div className='absolute top-2 right-2'>
          <Button
            aria-label={t('trips.uploadPhoto')}
            className='h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background'
            disabled={uploading}
            onClick={(event) => {
              event.stopPropagation();
              fileRef.current?.click();
            }}
            size='icon'
            variant='outline'
          >
            {uploading ? <Loader2 className='animate-spin' size={14} /> : <Camera size={14} />}
          </Button>
        </div>
        <input
          accept='image/*'
          aria-hidden
          className='sr-only'
          onChange={(event) => {
            event.stopPropagation();
            handlePhotoChange(event);
          }}
          ref={fileRef}
          tabIndex={-1}
          type='file'
        />
      </div>

      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between gap-2'>
          <CardTitle className='text-base leading-snug'>{trip.name}</CardTitle>
          <div className='flex shrink-0 gap-1'>
            <Button
              className='h-7 w-7'
              onClick={(event) => {
                event.stopPropagation();
                onEdit(trip);
              }}
              size='icon'
              variant='ghost'
            >
              <Pencil size={14} />
            </Button>
            <Button
              className='h-7 w-7 text-destructive hover:text-destructive'
              onClick={(event) => {
                event.stopPropagation();
                onDelete(trip.id);
              }}
              size='icon'
              variant='ghost'
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='flex flex-1 flex-col gap-3'>
        {trip.locationName && (
          <div className='flex items-center gap-1.5 text-muted-foreground text-sm'>
            <MapPin className='shrink-0' size={13} />
            <span className='line-clamp-1'>{trip.locationName}</span>
          </div>
        )}

        <div className='flex items-center gap-1.5 text-muted-foreground text-sm'>
          <CalendarRange className='shrink-0' size={13} />
          <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
        </div>

        <div className='flex items-center gap-1.5 text-muted-foreground text-sm'>
          <Banknote className='shrink-0' size={13} />
          <span>{formatCurrency(trip.totalCost, currency, locale)}</span>
        </div>

        {trip.people.length > 0 && (
          <div className='mt-auto pt-2'>
            <AvatarGroup>
              {visiblePeople.map((p) => (
                <Avatar key={p.id} size='lg' title={p.name}>
                  {p.avatarUrl && <AvatarImage alt={p.name} src={p.avatarUrl} />}
                  <AvatarFallback>{getInitials(p.name)}</AvatarFallback>
                </Avatar>
              ))}
              {overflow > 0 && <AvatarGroupCount>+{overflow}</AvatarGroupCount>}
            </AvatarGroup>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TripsTable({ currency, trips, people }: Readonly<TripsTableProps>) {
  const t = useI18n();
  const locale = useCurrentLocale();
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<TripWithPeople | null>(null);
  const [createKey, setCreateKey] = useState(0);

  const handleCreate = async (data: TripData) => {
    try {
      await createTrip(data);
      setFormOpen(false);
      toast.success(t('trips.createSuccess'));
    } catch {
      toast.error(t('trips.createError'));
    }
  };

  const handleUpdate = async (data: TripData) => {
    if (!editing) {
      return;
    }
    try {
      await updateTrip(editing.id, data);
      toast.success(t('trips.updateSuccess'));
      setFormOpen(false);
      setEditing(null);
    } catch {
      toast.error(t('trips.updateError'));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }
    try {
      await deleteTrip(deleteId);
      toast.success(t('trips.deleteSuccess'));
    } catch {
      toast.error(t('trips.deleteError'));
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = useCallback((trip: TripWithPeople) => {
    setEditing(trip);
    setFormOpen(true);
  }, []);

  const openTripDetails = useCallback(
    (tripId: string) => {
      router.push(`/${locale}/trips/${tripId}`);
    },
    [locale, router]
  );

  const openCreate = () => {
    setEditing(null);
    setCreateKey((k) => k + 1);
    setFormOpen(true);
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-end'>
        <Button onClick={openCreate} size='sm'>
          <Plus size={16} />
          {t('trips.newTrip')}
        </Button>
      </div>

      {trips.length === 0 ? (
        <div className='rounded-lg border border-dashed py-12 text-center text-muted-foreground text-sm'>
          {t('trips.empty')}
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {trips.map((trip) => (
            <TripCard
              currency={currency}
              key={trip.id}
              locale={locale}
              onDelete={setDeleteId}
              onEdit={openEdit}
              onOpen={openTripDetails}
              trip={trip}
            />
          ))}
        </div>
      )}

      <TripFormDialog
        initialData={editing ?? undefined}
        key={editing ? editing.id : `create-${createKey}`}
        onOpenChange={(next) => {
          setFormOpen(next);
          if (!next) {
            setEditing(null);
          }
        }}
        onSubmit={editing ? handleUpdate : handleCreate}
        open={formOpen}
        people={people}
      />

      <AlertDialog onOpenChange={(open) => !open && setDeleteId(null)} open={Boolean(deleteId)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('trips.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('trips.deleteDialog.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('trips.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={handleDelete}
            >
              {t('trips.deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
