'use client';

import type { SelectPerson } from '@repo/database/db/schema';
import { PageContent } from '@repo/design-system/components/page-content';
import { Button } from '@repo/design-system/components/ui/button';
import { useI18n } from '@repo/localization/i18n/client';
import { Plus } from 'lucide-react';
import { useRef } from 'react';
import type { TripWithPeople } from '../../../../../lib/trips-actions';
import type { TripsTableHandle } from './trips-table';
import { TripsTable } from './trips-table';

type TripsContentClientProperties = {
  readonly currency: string;
  readonly people: SelectPerson[];
  readonly trips: TripWithPeople[];
};

export function TripsContentClient({ currency, people, trips }: TripsContentClientProperties) {
  const t = useI18n();
  const tableRef = useRef<TripsTableHandle>(null);

  return (
    <PageContent
      actions={
        <Button onClick={() => tableRef.current?.openCreate()} size='sm'>
          <Plus size={16} />
          {t('trips.newTrip')}
        </Button>
      }
      header={t('trips.title')}
      subTitle={t('trips.subTitle')}
    >
      <TripsTable currency={currency} people={people} ref={tableRef} trips={trips} />
    </PageContent>
  );
}
