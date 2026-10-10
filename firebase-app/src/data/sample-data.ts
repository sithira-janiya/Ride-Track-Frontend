import type { Alert, Route, Schedule, Stop, Vehicle } from '@/types/models';

/**
 * Sample data used until the Firebase backend is connected.
 * Replace the functions in `home-data.ts` with Firestore queries; the screens will not change.
 */

const routeStops: Record<string, Stop[]> = {
  'r-bus-1': [
    { name: 'Colombo Fort', lat: 6.9344, lng: 79.85, at: 0 },
    { name: 'Kadawatha', lat: 7.001, lng: 79.954, at: 0.2 },
    { name: 'Kurunegala', lat: 7.4863, lng: 80.3647, at: 0.62 },
    { name: 'Kandy', lat: 7.2906, lng: 80.6337, at: 1 },
  ],
  'r-bus-2': [
    { name: 'Colombo Fort', lat: 6.9344, lng: 79.85, at: 0 },
    { name: 'Panadura', lat: 6.7132, lng: 79.9026, at: 0.3 },
    { name: 'Kalutara', lat: 6.5854, lng: 79.9607, at: 0.45 },
    { name: 'Hikkaduwa', lat: 6.1395, lng: 80.1063, at: 0.8 },
    { name: 'Galle', lat: 6.0535, lng: 80.221, at: 1 },
  ],
  'r-bus-240': [
    { name: 'Colombo Fort', lat: 6.9344, lng: 79.85, at: 0 },
    { name: 'Kelaniya', lat: 6.9553, lng: 79.9217, at: 0.2 },
    { name: 'Ja-Ela', lat: 7.0744, lng: 79.8919, at: 0.5 },
    { name: 'Negombo', lat: 7.2008, lng: 79.8737, at: 1 },
  ],
  'r-train-1': [
    { name: 'Colombo Fort', lat: 6.9335, lng: 79.8503, at: 0 },
    { name: 'Peradeniya Junction', lat: 7.2578, lng: 80.5953, at: 0.38 },
    { name: 'Nanu Oya', lat: 6.9697, lng: 80.7016, at: 0.65 },
    { name: 'Ella', lat: 6.8667, lng: 81.0466, at: 0.88 },
    { name: 'Badulla', lat: 6.9895, lng: 81.0557, at: 1 },
  ],
  'r-train-2': [
    { name: 'Colombo Fort', lat: 6.9335, lng: 79.8503, at: 0 },
    { name: 'Panadura', lat: 6.7132, lng: 79.9026, at: 0.22 },
    { name: 'Hikkaduwa', lat: 6.1395, lng: 80.1063, at: 0.6 },
    { name: 'Galle', lat: 6.0535, lng: 80.221, at: 0.8 },
    { name: 'Matara', lat: 5.9485, lng: 80.5353, at: 1 },
  ],
  'r-train-3': [
    { name: 'Colombo Fort', lat: 6.9335, lng: 79.8503, at: 0 },
    { name: 'Polgahawela', lat: 7.3333, lng: 80.3, at: 0.3 },
    { name: 'Anuradhapura', lat: 8.3114, lng: 80.4037, at: 0.55 },
    { name: 'Vavuniya', lat: 8.7514, lng: 80.4971, at: 0.72 },
    { name: 'Jaffna', lat: 9.6615, lng: 80.0255, at: 1 },
  ],
};

const vehicleFacilities: Record<string, string[]> = {
  'v-1': ['Air Conditioning', 'Wi-Fi', 'USB Charging'],
  'v-2': ['Air Conditioning', 'USB Charging'],
  'v-3': ['Reserved Seating'],
  'v-4': ['Air Conditioning', 'Wi-Fi', 'Reserved Seating'],
  'v-5': ['Reserved Seating', 'USB Charging'],
  'v-6': ['Air Conditioning', 'Reserved Seating'],
};

const baseRoutes: Omit<Route, 'stops'>[] = [
  { id: 'r-bus-1', type: 'bus', name: 'Route 1', from: 'Colombo', to: 'Kandy', fare: 480 },
  { id: 'r-bus-2', type: 'bus', name: 'Route 2', from: 'Colombo', to: 'Galle', fare: 420 },
  { id: 'r-bus-240', type: 'bus', name: 'Route 240', from: 'Colombo', to: 'Negombo', fare: 160 },
  { id: 'r-train-1', type: 'train', name: 'Main Line', from: 'Colombo Fort', to: 'Badulla', fare: 900 },
  { id: 'r-train-2', type: 'train', name: 'Coastal Line', from: 'Colombo Fort', to: 'Matara', fare: 550 },
  { id: 'r-train-3', type: 'train', name: 'Northern Line', from: 'Colombo Fort', to: 'Jaffna', fare: 1400 },
];

export const sampleRoutes: Route[] = baseRoutes.map((r) => ({ ...r, stops: routeStops[r.id] }));

const baseVehicles: Omit<Vehicle, 'facilities'>[] = [
  { id: 'v-1', type: 'bus', number: 'NB-4521', routeId: 'r-bus-1', routeName: 'Colombo to Kandy', status: 'on-time', etaMinutes: 4, nextStop: 'Pettah' },
  { id: 'v-2', type: 'bus', number: 'NA-8830', routeId: 'r-bus-2', routeName: 'Colombo to Galle', status: 'delayed', etaMinutes: 12, nextStop: 'Bambalapitiya' },
  { id: 'v-3', type: 'bus', number: 'WP-2284', routeId: 'r-bus-240', routeName: 'Colombo to Negombo', status: 'on-time', etaMinutes: 7, nextStop: 'Maradana' },
  { id: 'v-4', type: 'train', number: 'Udarata Menike 1015', routeId: 'r-train-1', routeName: 'Colombo Fort to Badulla', status: 'on-time', etaMinutes: 18, nextStop: 'Maradana' },
  { id: 'v-5', type: 'train', number: 'Ruhunu Kumari 8057', routeId: 'r-train-2', routeName: 'Colombo Fort to Matara', status: 'delayed', etaMinutes: 25, nextStop: 'Kollupitiya' },
  { id: 'v-6', type: 'train', number: 'Yal Devi 4077', routeId: 'r-train-3', routeName: 'Colombo Fort to Jaffna', status: 'on-time', etaMinutes: 32, nextStop: 'Ragama' },
];

export const sampleVehicles: Vehicle[] = baseVehicles.map((v) => ({ ...v, facilities: vehicleFacilities[v.id] }));

export const sampleAlerts: Alert[] = [
  { id: 'a-1', type: 'bus', title: 'Route 2 diversion', message: 'Buses on Route 2 use Galle Road service lane near Wellawatte.', minutesAgo: 20 },
  { id: 'a-2', type: 'train', title: 'Coastal Line delay', message: 'Matara-bound trains are running about 15 minutes late.', minutesAgo: 35 },
  { id: 'a-3', type: null, title: 'Heavy rain warning', message: 'Expect delays on all services this evening.', minutesAgo: 90 },
];

let tripCount = 0;

const trip = (
  id: string,
  routeId: string,
  vehicleId: string,
  type: Schedule['type'],
  departure: string,
  durationMinutes: number,
  status: Schedule['status'] = 'on-time',
): Schedule => {
  tripCount += 1;
  // Sample seat counts between 6 and 40, spread so the list looks varied.
  const seatsAvailable = 6 + ((tripCount * 11) % 35);
  return { id, type, routeId, vehicleId, departure, durationMinutes, status, seatsAvailable };
};

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
