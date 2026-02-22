'use client';

import { Clock } from 'lucide-react';
import * as React from 'react';

import { Label } from '@/components/ui/label';

import { TimePickerInput } from './time-picker-input';

interface TimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  showSeconds?: boolean;
  required?: boolean;
}

export function TimePicker({
  required,
  date,
  setDate,
  showSeconds,
}: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const secondRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className='flex items-end gap-2'>
      <div className='grid gap-1 text-center'>
        <Label className='text-xs' htmlFor='hours'>
          Stunde
        </Label>
        <TimePickerInput
          date={date}
          onRightFocus={() => minuteRef.current?.focus()}
          picker='hours'
          ref={hourRef}
          required={required}
          setDate={setDate}
        />
      </div>
      <div className='grid gap-1 text-center'>
        <Label className='text-xs' htmlFor='minutes'>
          Minute
        </Label>
        <TimePickerInput
          date={date}
          onLeftFocus={() => hourRef.current?.focus()}
          onRightFocus={() => secondRef.current?.focus()}
          picker='minutes'
          ref={minuteRef}
          required={required}
          setDate={setDate}
        />
      </div>
      {showSeconds && (
        <div className='grid gap-1 text-center'>
          <Label className='text-xs' htmlFor='seconds'>
            Sekunde
          </Label>
          <TimePickerInput
            date={date}
            onLeftFocus={() => minuteRef.current?.focus()}
            picker='seconds'
            ref={secondRef}
            required={required && showSeconds}
            setDate={setDate}
          />
        </div>
      )}
      <div className='flex h-10 items-center'>
        <Clock className='ml-2 h-4 w-4' />
      </div>
    </div>
  );
}
