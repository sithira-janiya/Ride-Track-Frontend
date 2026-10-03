import type { Alert, Route, Schedule, Vehicle } from '@/types/models';

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

const trip = (
  id: string,
  routeId: string,
  vehicleId: string,
  type: Schedule['type'],
  departure: string,
  durationMinutes: number,
  status: Schedule['status'] = 'on-time',
): Schedule => ({ id, type, routeId, vehicleId, departure, durationMinutes, status });

export const sampleSchedules: Schedule[] = [
  trip('s-b1-1', 'r-bus-1', 'v-1', 'bus', '05:30', 210),
  trip('s-b1-2', 'r-bus-1', 'v-1', 'bus', '08:15', 200),
  trip('s-b1-3', 'r-bus-1', 'v-1', 'bus', '13:00', 220, 'delayed'),
  trip('s-b1-4', 'r-bus-1', 'v-1', 'bus', '18:30', 210),
  trip('s-b2-1', 'r-bus-2', 'v-2', 'bus', '06:00', 150),
  trip('s-b2-2', 'r-bus-2', 'v-2', 'bus', '09:30', 160, 'delayed'),
  trip('s-b2-3', 'r-bus-2', 'v-2', 'bus', '15:45', 150),
  trip('s-b2-4', 'r-bus-2', 'v-2', 'bus', '19:00', 155),
  trip('s-b240-1', 'r-bus-240', 'v-3', 'bus', '05:45', 70),
  trip('s-b240-2', 'r-bus-240', 'v-3', 'bus', '12:30', 75),
  trip('s-b240-3', 'r-bus-240', 'v-3', 'bus', '17:15', 80, 'delayed'),
  trip('s-b240-4', 'r-bus-240', 'v-3', 'bus', '21:30', 65),
  trip('s-t1-1', 'r-train-1', 'v-4', 'train', '05:55', 570),
  trip('s-t1-2', 'r-train-1', 'v-4', 'train', '08:30', 600),
  trip('s-t1-3', 'r-train-1', 'v-4', 'train', '20:30', 660),
  trip('s-t2-1', 'r-train-2', 'v-5', 'train', '06:55', 165),
  trip('s-t2-2', 'r-train-2', 'v-5', 'train', '11:20', 175, 'delayed'),
  trip('s-t2-3', 'r-train-2', 'v-5', 'train', '16:10', 170),
  trip('s-t2-4', 'r-train-2', 'v-5', 'train', '18:05', 165),
  trip('s-t3-1', 'r-train-3', 'v-6', 'train', '06:00', 480),
  trip('s-t3-2', 'r-train-3', 'v-6', 'train', '09:45', 465),
  trip('s-t3-3', 'r-train-3', 'v-6', 'train', '22:00', 510, 'delayed'),
];
