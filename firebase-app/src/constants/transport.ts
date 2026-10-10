import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type TransportType = 'bus' | 'train';

type IconName = ComponentProps<typeof Ionicons>['name'];

export const transportOptions: Record<
  TransportType,
  { label: string; plural: string; description: string; icon: IconName; color: string }
> = {
  bus: {
    label: 'Bus',
    plural: 'Buses',
    description: 'NTC and private buses across Sri Lanka',
    icon: 'bus-outline',
    color: '#2563EB',
  },
  train: {
    label: 'Train',
    plural: 'Trains',
    description: 'Sri Lanka Railways intercity and local trains',
    icon: 'train-outline',
    color: '#0E7490',
  },
};

export const transportTypes = Object.keys(transportOptions) as TransportType[];
