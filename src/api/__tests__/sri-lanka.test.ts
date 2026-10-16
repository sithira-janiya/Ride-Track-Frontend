import { parseRegions } from '@/config/env';

import { mockApi } from '../mock';

// The default build: Sri Lanka only (EXPO_PUBLIC_REGIONS unset).
jest.mock('@/config/env', () => ({ ...jest.requireActual('@/config/env'), env: { ...jest.requireActual('@/config/env').env, regions: ['SRI_LANKA'] } }));

describe('Sri Lanka network (mock backend, default build)', () => {
  it('lists only Sri Lankan routes: SLTB and private buses by NTC route number, and Sri Lanka Railways lines', async () => {
    const routes = await mockApi.searchRoutes();
    expect(routes.map((r) => r.routeNo)).toEqual(['138', 'MAIN', '177', '100', '187', '1', '2', 'COAST']);
    expect(routes.every((r) => r.region === 'SRI_LANKA' && r.currency === 'LKR' && r.timeZone === 'Asia/Colombo')).toBe(true);
    expect(routes.filter((r) => r.mode === 'BUS').every((r) => r.minFare === 27 && r.operators?.join() === 'SLTB,PRIVATE')).toBe(true);
    expect(routes.filter((r) => r.mode === 'TRAIN').every((r) => r.operators?.join() === 'SLR')).toBe(true);
    expect(await mockApi.searchRoutes('Expo 2020')).toEqual([]);
  });

  it('has the stops in the real order', async () => {
    const bus138 = await mockApi.getRoute(1);
    expect(bus138.stops.map((s) => s.name)).toEqual([
      'Pettah (Central Bus Stand)', 'Town Hall', 'Thummulla', 'Kirulapone', 'Nugegoda', 'Delkanda', 'Navinna', 'Maharagama', 'Pannipitiya', 'Kottawa',
    ]);
    const coast = (await mockApi.searchRoutes('Coastal'))[0];
    const stops = (await mockApi.getRoute(coast.routeId)).stops;
    expect([stops[0].name, stops.at(-1)!.name]).toEqual(['Colombo Fort', 'Matara']);
    expect(stops.map((s) => s.name)).toEqual(expect.arrayContaining(['Mount Lavinia', 'Kalutara', 'Galle']));
    // stop fares only ever go up along a route
    for (const s of stops.slice(1)) expect(s.fareFromOrigin!).toBeGreaterThan(stops[s.stopSequence! - 2].fareFromOrigin!);
  });

  it('never offers a Dubai stop, even when the phone is in Dubai', async () => {
    const stops = await mockApi.nearbyStops(25.1972, 55.2744); // Dubai Mall
    expect(stops.length).toBeGreaterThan(0);
    expect(stops.every((s) => s.stopId < 1000)).toBe(true);
  });

  it('shows SLTB, private and railway vehicles on the officer dashboard, and nothing from Dubai', async () => {
    const { vehicles } = await mockApi.getDashboard();
    expect(vehicles.every((v) => v.region === 'SRI_LANKA')).toBe(true);
    expect(new Set(vehicles.map((v) => v.operator))).toEqual(new Set(['SLTB', 'PRIVATE', 'SLR']));
    expect(vehicles.filter((v) => v.mode === 'TRAIN').every((v) => v.operator === 'SLR')).toBe(true);
  });

  it('keeps the back office to Sri Lanka', async () => {
    expect((await mockApi.adminRoutes()).every((r) => r.region === 'SRI_LANKA')).toBe(true);
    expect((await mockApi.adminVehicles()).every((v) => v.vehicleId < 100000 && v.operator)).toBe(true);
    const trips = await mockApi.adminTrips(new Date().toISOString().slice(0, 10));
    expect(trips.length).toBeGreaterThan(0);
    expect(trips.every((t) => t.timeZone === 'Asia/Colombo')).toBe(true);
  });
});

describe('EXPO_PUBLIC_REGIONS', () => {
  it('reads a comma-separated list and falls back to Sri Lanka', () => {
    expect(parseRegions('SRI_LANKA,dubai')).toEqual(['SRI_LANKA', 'DUBAI']);
    expect(parseRegions(' DUBAI , DUBAI ')).toEqual(['DUBAI']);
    expect(parseRegions(undefined)).toEqual(['SRI_LANKA']);
    expect(parseRegions('')).toEqual(['SRI_LANKA']);
    expect(parseRegions('MARS')).toEqual(['SRI_LANKA']);
  });
});
