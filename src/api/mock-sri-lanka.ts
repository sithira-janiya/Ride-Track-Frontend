// Sri Lanka in mock mode: real SLTB / private bus routes (NTC route numbers) and Sri Lanka Railways lines, with their
// stops in the real order. Positions are approximate (town centres and stations). Fares are indicative demo fares in
// rupees, not the NTC fare table: bus fares never go below the NTC minimum fare (Rs. 27 since July 2025).
// Ids stay below 1000 so they never clash with the Dubai data (see mock-dubai.ts).
import type { Operator, Route, Stop } from '@/types';

const SRI_LANKA = { region: 'SRI_LANKA', timeZone: 'Asia/Colombo', currency: 'LKR', zoneFares: null } as const;
const BUS = { mode: 'BUS', minFare: 27, operators: ['SLTB', 'PRIVATE'] as Operator[] } as const;
const TRAIN = { mode: 'TRAIN', minFare: 20, operators: ['SLR'] as Operator[] } as const;

export const sriLankaStops: Stop[] = [
  { stopId: 1, name: 'Colombo Fort', latitude: 6.9335, longitude: 79.8501 },
  { stopId: 2, name: 'Maradana', latitude: 6.929, longitude: 79.8656 },
  { stopId: 3, name: 'Borella', latitude: 6.9147, longitude: 79.8777 },
  { stopId: 4, name: 'Nugegoda', latitude: 6.8649, longitude: 79.8997 },
  { stopId: 5, name: 'Kottawa', latitude: 6.8419, longitude: 79.9654 },
  { stopId: 6, name: 'Ragama', latitude: 7.0289, longitude: 79.9219 },
  { stopId: 7, name: 'Gampaha', latitude: 7.0873, longitude: 79.9925 },
  { stopId: 8, name: 'Kandy', latitude: 7.2906, longitude: 80.6337 },
  { stopId: 9, name: 'Pettah (Central Bus Stand)', latitude: 6.9346, longitude: 79.8545 },
  { stopId: 10, name: 'Town Hall', latitude: 6.9164, longitude: 79.8636 },
  { stopId: 11, name: 'Thummulla', latitude: 6.895, longitude: 79.862 },
  { stopId: 12, name: 'Kirulapone', latitude: 6.879, longitude: 79.878 },
  { stopId: 13, name: 'Delkanda', latitude: 6.862, longitude: 79.906 },
  { stopId: 14, name: 'Navinna', latitude: 6.853, longitude: 79.92 },
  { stopId: 15, name: 'Maharagama', latitude: 6.847, longitude: 79.928 },
  { stopId: 16, name: 'Pannipitiya', latitude: 6.8455, longitude: 79.948 },
  { stopId: 17, name: 'Kollupitiya', latitude: 6.9115, longitude: 79.85 },
  { stopId: 18, name: 'Bambalapitiya', latitude: 6.8935, longitude: 79.8555 },
  { stopId: 19, name: 'Wellawatte', latitude: 6.8745, longitude: 79.86 },
  { stopId: 20, name: 'Dehiwala', latitude: 6.8515, longitude: 79.8655 },
  { stopId: 21, name: 'Mount Lavinia', latitude: 6.8335, longitude: 79.865 },
  { stopId: 22, name: 'Ratmalana', latitude: 6.8185, longitude: 79.88 },
  { stopId: 23, name: 'Moratuwa', latitude: 6.7735, longitude: 79.8825 },
  { stopId: 24, name: 'Panadura', latitude: 6.713, longitude: 79.9045 },
  { stopId: 25, name: 'Kalutara', latitude: 6.5855, longitude: 79.9605 },
  { stopId: 26, name: 'Aluthgama', latitude: 6.4335, longitude: 80.0 },
  { stopId: 27, name: 'Ambalangoda', latitude: 6.2355, longitude: 80.054 },
  { stopId: 28, name: 'Hikkaduwa', latitude: 6.1395, longitude: 80.1015 },
  { stopId: 29, name: 'Galle', latitude: 6.033, longitude: 80.214 },
  { stopId: 30, name: 'Weligama', latitude: 5.975, longitude: 80.429 },
  { stopId: 31, name: 'Matara', latitude: 5.9485, longitude: 80.5355 },
  { stopId: 32, name: 'Rajagiriya', latitude: 6.909, longitude: 79.8955 },
  { stopId: 33, name: 'Battaramulla', latitude: 6.8995, longitude: 79.9185 },
  { stopId: 34, name: 'Malabe', latitude: 6.9045, longitude: 79.9585 },
  { stopId: 35, name: 'Kaduwela', latitude: 6.9335, longitude: 79.9845 },
  { stopId: 36, name: 'Peliyagoda', latitude: 6.962, longitude: 79.884 },
  { stopId: 37, name: 'Kiribathgoda', latitude: 6.98, longitude: 79.929 },
  { stopId: 38, name: 'Kadawatha', latitude: 7.001, longitude: 79.953 },
  { stopId: 39, name: 'Nittambuwa', latitude: 7.144, longitude: 80.096 },
  { stopId: 40, name: 'Warakapola', latitude: 7.226, longitude: 80.198 },
  { stopId: 41, name: 'Kegalle', latitude: 7.251, longitude: 80.346 },
  { stopId: 42, name: 'Mawanella', latitude: 7.2525, longitude: 80.4465 },
  { stopId: 43, name: 'Kadugannawa', latitude: 7.2545, longitude: 80.524 },
  { stopId: 44, name: 'Peradeniya', latitude: 7.269, longitude: 80.597 },
  { stopId: 45, name: 'Wattala', latitude: 6.989, longitude: 79.892 },
  { stopId: 46, name: 'Ja-Ela', latitude: 7.0745, longitude: 79.8915 },
  { stopId: 47, name: 'Seeduwa', latitude: 7.13, longitude: 79.879 },
  { stopId: 48, name: 'Katunayake Airport', latitude: 7.176, longitude: 79.884 },
  { stopId: 49, name: 'Veyangoda', latitude: 7.156, longitude: 80.057 },
  { stopId: 50, name: 'Polgahawela', latitude: 7.3335, longitude: 80.301 },
  { stopId: 51, name: 'Rambukkana', latitude: 7.324, longitude: 80.392 },
];

export const sriLankaRoutes: Route[] = [
  { routeId: 1, routeNo: '138', name: 'Pettah - Kottawa', origin: 'Pettah', destination: 'Kottawa', ...BUS, ...SRI_LANKA },
  { routeId: 2, routeNo: 'MAIN', name: 'Main Line - Colombo Fort to Kandy', origin: 'Colombo Fort', destination: 'Kandy', ...TRAIN, ...SRI_LANKA },
  { routeId: 3, routeNo: '177', name: 'Kollupitiya - Kaduwela', origin: 'Kollupitiya', destination: 'Kaduwela', ...BUS, ...SRI_LANKA },
  { routeId: 4, routeNo: '100', name: 'Pettah - Panadura', origin: 'Pettah', destination: 'Panadura', ...BUS, ...SRI_LANKA },
  { routeId: 5, routeNo: '187', name: 'Pettah - Katunayake Airport', origin: 'Pettah', destination: 'Katunayake Airport', ...BUS, ...SRI_LANKA },
  { routeId: 6, routeNo: '1', name: 'Colombo - Kandy', origin: 'Pettah', destination: 'Kandy', ...BUS, ...SRI_LANKA },
  { routeId: 7, routeNo: '2', name: 'Colombo - Matara', origin: 'Pettah', destination: 'Matara', ...BUS, ...SRI_LANKA },
  { routeId: 8, routeNo: 'COAST', name: 'Coastal Line - Colombo Fort to Matara', origin: 'Colombo Fort', destination: 'Matara', ...TRAIN, ...SRI_LANKA },
];

/** route -> ordered [stopId, fareFromOrigin] */
export const sriLankaRouteStops: Record<number, [number, number][]> = {
  1: [[9, 0], [10, 27], [11, 35], [12, 45], [4, 55], [13, 62], [14, 70], [15, 76], [16, 86], [5, 96]],
  2: [[1, 0], [2, 40], [6, 70], [7, 100], [49, 130], [50, 210], [51, 240], [43, 300], [44, 320], [8, 340]],
  3: [[17, 0], [10, 27], [3, 35], [32, 45], [33, 55], [34, 66], [35, 76]],
  4: [[9, 0], [17, 35], [18, 45], [19, 55], [20, 66], [21, 76], [22, 86], [23, 100], [24, 125]],
  5: [[9, 0], [36, 35], [45, 55], [46, 86], [47, 110], [48, 130]],
  6: [[9, 0], [36, 35], [37, 45], [38, 66], [39, 140], [40, 190], [41, 240], [42, 280], [43, 320], [44, 340], [8, 360]],
  7: [[9, 0], [19, 45], [21, 66], [23, 86], [24, 120], [25, 170], [26, 220], [27, 290], [28, 330], [29, 380], [30, 440], [31, 480]],
  8: [[1, 0], [17, 30], [18, 40], [19, 50], [20, 60], [21, 70], [23, 90], [24, 110], [25, 140], [26, 170], [27, 210], [28, 240], [29, 270], [30, 310], [31, 340]],
};

export type MockVehicle = {
  vehicleId: number;
  regNo: string;
  operator: Operator;
  /** where it starts on its back-and-forth run, and how long one round trip takes in the demo */
  offsetSec: number;
  periodSec: number;
  passengerCount: number;
  capacity: number;
};

/** SLTB and private buses share each route number, as on the road; trains are Sri Lanka Railways. */
export const sriLankaVehicles: Record<number, MockVehicle[]> = {
  1: [
    { vehicleId: 101, regNo: 'NB-1234', operator: 'SLTB', offsetSec: 0, periodSec: 240, passengerCount: 28, capacity: 52 },
    { vehicleId: 102, regNo: 'NB-5678', operator: 'PRIVATE', offsetSec: 120, periodSec: 240, passengerCount: 50, capacity: 52 },
    { vehicleId: 103, regNo: 'ND-4521', operator: 'PRIVATE', offsetSec: 60, periodSec: 300, passengerCount: 41, capacity: 54 },
  ],
  2: [
    { vehicleId: 201, regNo: 'TR-0042', operator: 'SLR', offsetSec: 30, periodSec: 600, passengerCount: 310, capacity: 480 },
    { vehicleId: 202, regNo: 'TR-1015', operator: 'SLR', offsetSec: 330, periodSec: 600, passengerCount: 455, capacity: 480 },
  ],
  3: [
    { vehicleId: 301, regNo: 'NC-7788', operator: 'PRIVATE', offsetSec: 40, periodSec: 260, passengerCount: 33, capacity: 52 },
    { vehicleId: 302, regNo: 'NA-3310', operator: 'SLTB', offsetSec: 170, periodSec: 260, passengerCount: 19, capacity: 52 },
  ],
  4: [
    { vehicleId: 401, regNo: 'NB-2210', operator: 'PRIVATE', offsetSec: 10, periodSec: 320, passengerCount: 54, capacity: 56 },
    { vehicleId: 402, regNo: 'NA-6604', operator: 'SLTB', offsetSec: 120, periodSec: 320, passengerCount: 37, capacity: 54 },
    { vehicleId: 403, regNo: 'ND-9932', operator: 'PRIVATE', offsetSec: 230, periodSec: 320, passengerCount: 22, capacity: 54 },
  ],
  5: [
    { vehicleId: 501, regNo: 'NC-1870', operator: 'SLTB', offsetSec: 50, periodSec: 360, passengerCount: 26, capacity: 52 },
    { vehicleId: 502, regNo: 'NE-4187', operator: 'PRIVATE', offsetSec: 210, periodSec: 360, passengerCount: 47, capacity: 52 },
  ],
  6: [
    { vehicleId: 601, regNo: 'NB-0101', operator: 'SLTB', offsetSec: 100, periodSec: 900, passengerCount: 49, capacity: 54 },
    { vehicleId: 602, regNo: 'ND-7001', operator: 'PRIVATE', offsetSec: 520, periodSec: 900, passengerCount: 54, capacity: 54 },
  ],
  7: [
    { vehicleId: 701, regNo: 'NA-0202', operator: 'SLTB', offsetSec: 200, periodSec: 900, passengerCount: 31, capacity: 54 },
    { vehicleId: 702, regNo: 'NE-2020', operator: 'PRIVATE', offsetSec: 640, periodSec: 900, passengerCount: 52, capacity: 54 },
  ],
  8: [
    { vehicleId: 801, regNo: 'TR-0815', operator: 'SLR', offsetSec: 90, periodSec: 700, passengerCount: 380, capacity: 480 },
    { vehicleId: 802, regNo: 'TR-8058', operator: 'SLR', offsetSec: 440, periodSec: 700, passengerCount: 205, capacity: 480 },
  ],
};
