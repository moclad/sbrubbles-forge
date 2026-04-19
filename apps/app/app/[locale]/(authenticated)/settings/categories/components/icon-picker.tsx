'use client';

import { cn } from '@repo/design-system/lib/utils';
import type { LucideIcon } from 'lucide-react';
import {
  Bed,
  Bus,
  Car,
  Coffee,
  CreditCard,
  Dumbbell,
  Flame,
  Fuel,
  Gift,
  Globe,
  Heart,
  Hotel,
  IceCream,
  Map as MapIcon,
  Mic,
  Music,
  Package,
  Palmtree,
  Pizza,
  Plane,
  ShoppingBag,
  ShoppingCart,
  Stethoscope,
  Ticket,
  Train,
  Tv,
  Umbrella,
  Utensils,
  Wine,
  Zap,
} from 'lucide-react';
export const CATEGORY_ICONS: {
  name: string;
  icon: LucideIcon;
  group: string;
}[] = [
  // Transport
  { group: 'Transport', icon: Plane, name: 'Plane' },
  { group: 'Transport', icon: Car, name: 'Car' },
  { group: 'Transport', icon: Train, name: 'Train' },
  { group: 'Transport', icon: Bus, name: 'Bus' },
  { group: 'Transport', icon: Fuel, name: 'Fuel' },
  // Accommodation
  { group: 'Accommodation', icon: Hotel, name: 'Hotel' },
  { group: 'Accommodation', icon: Bed, name: 'Bed' },
  // Food & Drink
  { group: 'Food & Drink', icon: Utensils, name: 'Utensils' },
  { group: 'Food & Drink', icon: Coffee, name: 'Coffee' },
  { group: 'Food & Drink', icon: Pizza, name: 'Pizza' },
  { group: 'Food & Drink', icon: Wine, name: 'Wine' },
  { group: 'Food & Drink', icon: IceCream, name: 'IceCream' },
  // Entertainment
  { group: 'Entertainment', icon: Ticket, name: 'Ticket' },
  { group: 'Entertainment', icon: Music, name: 'Music' },
  { group: 'Entertainment', icon: Tv, name: 'Tv' },
  { group: 'Entertainment', icon: Mic, name: 'Mic' },
  // Shopping
  { group: 'Shopping', icon: ShoppingBag, name: 'ShoppingBag' },
  { group: 'Shopping', icon: ShoppingCart, name: 'ShoppingCart' },
  { group: 'Shopping', icon: Gift, name: 'Gift' },
  { group: 'Shopping', icon: Package, name: 'Package' },
  // Health
  { group: 'Health', icon: Stethoscope, name: 'Stethoscope' },
  { group: 'Health', icon: Heart, name: 'Heart' },
  { group: 'Health', icon: Dumbbell, name: 'Dumbbell' },
  // Activities / Other
  { group: 'Activities', icon: MapIcon, name: 'Map' },
  { group: 'Activities', icon: Globe, name: 'Globe' },
  { group: 'Activities', icon: Palmtree, name: 'Palmtree' },
  { group: 'Activities', icon: Umbrella, name: 'Umbrella' },
  { group: 'Activities', icon: Flame, name: 'Flame' },
  { group: 'Other', icon: CreditCard, name: 'CreditCard' },
  { group: 'Other', icon: Zap, name: 'Zap' },
];

export function getIconComponent(name: string): LucideIcon {
  return CATEGORY_ICONS.find((i) => i.name === name)?.icon ?? CreditCard;
}

type IconPickerProps = {
  value: string;
  onChange: (name: string) => void;
};

export function IconPicker({ value, onChange }: Readonly<IconPickerProps>) {
  const groups = [...new Set(CATEGORY_ICONS.map((i) => i.group))];

  return (
    <div className='max-h-52 overflow-y-auto rounded-md border p-2'>
      {groups.map((group) => (
        <div className='mb-2 last:mb-0' key={group}>
          <p className='mb-1 px-1 font-medium text-muted-foreground text-xs'>{group}</p>
          <div className='flex flex-wrap gap-1'>
            {CATEGORY_ICONS.filter((i) => i.group === group).map(({ name, icon: Icon }) => (
              <button
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-muted',
                  value === name && 'border-primary bg-primary/10 text-primary'
                )}
                key={name}
                onClick={() => onChange(name)}
                title={name}
                type='button'
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
