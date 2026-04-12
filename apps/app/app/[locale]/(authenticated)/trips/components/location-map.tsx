'use client';

import type { Point } from 'pigeon-maps';
import { Draggable, Map, Marker } from 'pigeon-maps';
import { osm } from 'pigeon-maps/providers';
import { useEffect, useState } from 'react';

type LocationMapProps = {
  lat: number;
  lng: number;
  locationName?: string | null;
  onPositionChange?: (lat: number, lng: number) => void;
};

// SVG pin whose visual bottom-center sits at the anchor point.
// 24×36 viewport; offset passed to Draggable = [12, 36].
function DraggablePin() {
  return (
    <svg
      height={36}
      style={{ cursor: 'grab', display: 'block', userSelect: 'none' }}
      viewBox='0 0 24 36'
      width={24}
    >
      <title>Location pin</title>
      <path
        d='M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z'
        fill='#ef4444'
      />
      <circle cx='12' cy='12' fill='white' r='5' />
    </svg>
  );
}

export function LocationMap({
  lat,
  lng,
  onPositionChange,
}: Readonly<LocationMapProps>) {
  const [markerPos, setMarkerPos] = useState<Point>([lat, lng]);
  const [center, setCenter] = useState<Point>([lat, lng]);

  // Re-center and reposition when a new search result arrives.
  useEffect(() => {
    setMarkerPos([lat, lng]);
    setCenter([lat, lng]);
  }, [lat, lng]);

  const interactive = Boolean(onPositionChange);

  function handleNewPos(pos: Point) {
    setMarkerPos(pos);
    onPositionChange?.(pos[0], pos[1]);
  }

  return (
    <div className='overflow-hidden rounded-md border'>
      <Map
        center={center}
        defaultZoom={18}
        height={280}
        metaWheelZoom
        onBoundsChanged={({ center: c }: { center: Point }) => setCenter(c)}
        onClick={
          interactive
            ? ({ latLng }: { latLng: Point }) => handleNewPos(latLng)
            : undefined
        }
        provider={osm}
        width={undefined}
      >
        {interactive ? (
          // offset=[12,36] places the pin's bottom-center at the anchor.
          <Draggable
            anchor={markerPos}
            offset={[12, 36]}
            onDragEnd={(pos: Point) => handleNewPos(pos)}
          >
            <DraggablePin />
          </Draggable>
        ) : (
          <Marker anchor={markerPos} color='#ef4444' width={36} />
        )}
      </Map>
    </div>
  );
}
