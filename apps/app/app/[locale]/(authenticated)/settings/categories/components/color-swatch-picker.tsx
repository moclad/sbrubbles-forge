'use client';

import {
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorThumb,
  SliderTrack,
} from '@repo/design-system/components/ui/color';
import { Input, Label, parseColor } from 'react-aria-components';

export function randomHex(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 65 + Math.floor(Math.random() * 20); // 65–85%
  const l = 45 + Math.floor(Math.random() * 15); // 45–60%
  return hslToHex(h, s, l);
}

function hslToHex(h: number, s: number, l: number): string {
  const sl = s / 100;
  const ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n: number): string => {
    const k = (n + h / 30) % 12;
    const color = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

type CategoryColorPickerProps = {
  value: string;
  onChange: (hex: string) => void;
};

export function CategoryColorPicker({
  value,
  onChange,
}: Readonly<CategoryColorPickerProps>) {
  return (
    <ColorPicker
      onChange={(color) => onChange(color.toString('hex'))}
      value={parseColor(value).toFormat('hsb')}
    >
      <div className='flex flex-col items-center gap-3'>
        <ColorArea colorSpace='hsb' xChannel='saturation' yChannel='brightness'>
          <ColorThumb />
        </ColorArea>
        <ColorSlider channel='hue' colorSpace='hsb'>
          <SliderTrack>
            <ColorThumb />
          </SliderTrack>
        </ColorSlider>
        <div className='flex w-full items-center gap-2'>
          <ColorSwatch className='h-8 w-8 shrink-0 rounded-md border border-border' />
          <ColorField className='flex-1'>
            <Label className='sr-only'>Hex color</Label>
            <Input className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50' />
          </ColorField>
        </div>
      </div>
    </ColorPicker>
  );
}
