'use client';

import { Map, Marker } from 'pigeon-maps';
import { osm } from 'pigeon-maps/providers';

type LocationMapProps = {
  lat: number;
  lng: number;
  locationName?: string | null;
};

export function LocationMap({ lat, lng }: Readonly<LocationMapProps>) {
  return (
    <div className='overflow-hidden rounded-md border'>
      <Map
        center={[lat, lng]}
        defaultZoom={18}
        height={350}
        metaWheelZoom
        provider={osm}
        width={undefined}
      >
        <Marker anchor={[lat, lng]} color='#ef4444' width={36} />
      </Map>
    </div>
  );
}
