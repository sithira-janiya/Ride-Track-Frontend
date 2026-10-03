import type { Alert, Route, Vehicle } from '@/types/models';

/**
 * Sample data used until the Firebase backend is connected.
 * Replace the functions in `home-data.ts` with Firestore queries; the screens will not change.
 */

export const sampleRoutes: Route[] = [
  { id: 'r-bus-1', type: 'bus', name: 'Route 1', from: 'Colombo', to: 'Kandy', fare: 480 },
  { id: 'r-bus-2', type: 'bus', name: 'Route 2', from: 'Colombo', to: 'Galle', fare: 420 },
  { id: 'r-bus-240', type: 'bus', name: 'Route 240', from: 'Colombo', to: 'Negombo', fare: 160 },
  { id: 'r-train-1', type: 'train', name: 'Main Line', from: 'Colombo Fort', to: 'Badulla', fare: 900 },
  { id: 'r-train-2', type: 'train', name: 'Coastal Line', from: 'Colombo Fort', to: 'Matara', fare: 550 },
  { id: 'r-train-3', type: 'train', name: 'Northern Line', from: 'Colombo Fort', to: 'Jaffna', fare: 1400 },
];

export const sampleVehicles: Vehicle[] = [
  { id: 'v-1', type: 'bus', number: 'NB-4521', routeId: 'r-bus-1', routeName: 'Colombo to Kandy', status: 'on-time', etaMinutes: 4, nextStop: 'Pettah' },
  { id: 'v-2', type: 'bus', number: 'NA-8830', routeId: 'r-bus-2', routeName: 'Colombo to Galle', status: 'delayed', etaMinutes: 12, nextStop: 'Bambalapitiya' },
  { id: 'v-3', type: 'bus', number: 'WP-2284', routeId: 'r-bus-240', routeName: 'Colombo to Negombo', status: 'on-time', etaMinutes: 7, nextStop: 'Maradana' },
  { id: 'v-4', type: 'train', number: 'Udarata Menike 1015', routeId: 'r-train-1', routeName: 'Colombo Fort to Badulla', status: 'on-time', etaMinutes: 18, nextStop: 'Maradana' },
  { id: 'v-5', type: 'train', number: 'Ruhunu Kumari 8057', routeId: 'r-train-2', routeName: 'Colombo Fort to Matara', status: 'delayed', etaMinutes: 25, nextStop: 'Kollupitiya' },
  { id: 'v-6', type: 'train', number: 'Yal Devi 4077', routeId: 'r-train-3', routeName: 'Colombo Fort to Jaffna', status: 'on-time', etaMinutes: 32, nextStop: 'Ragama' },
];

export const sampleAlerts: Alert[] = [
  { id: 'a-1', type: 'bus', title: 'Route 2 diversion', message: 'Buses on Route 2 use Galle Road service lane near Wellawatte.', minutesAgo: 20 },
  { id: 'a-2', type: 'train', title: 'Coastal Line delay', message: 'Matara-bound trains are running about 15 minutes late.', minutesAgo: 35 },
  { id: 'a-3', type: null, title: 'Heavy rain warning', message: 'Expect delays on all services this evening.', minutesAgo: 90 },
];
