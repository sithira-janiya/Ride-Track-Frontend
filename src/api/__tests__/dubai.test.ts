import { fareBetween } from '@/utils/fare';
import { formatClock, formatFare, routeLabel } from '@/utils/format';

import { mockApi } from '../mock';

const redToExpo = async () => (await mockApi.searchRoutes('Expo 2020', 'TRAIN', 'DUBAI')).find((r) => r.origin === 'Centrepoint')!;

describe('Dubai routes (mock backend, real RTA timetable data)', () => {
  it('lists the Dubai Metro, tram and buses with Dubai time and dirhams, separately from Sri Lanka', async () => {
    const dubai = await mockApi.searchRoutes('', undefined, 'DUBAI');
    expect(new Set(dubai.map((r) => r.routeNo))).toEqual(new Set(['Red', 'Green', 'Tram', 'C01', '27', '8', 'X28']));
    expect(dubai.every((r) => r.timeZone === 'Asia/Dubai' && r.currency === 'AED')).toBe(true);
    const sriLanka = await mockApi.searchRoutes('', undefined, 'SRI_LANKA');
    expect(sriLanka.map((r) => r.routeNo)).toEqual(['138', 'MAIN', '177']);
    expect(sriLanka.every((r) => r.currency === 'LKR' && r.zoneFares === null)).toBe(true);
  });

  it('has the real stations in order, with fare zones and running times', async () => {
    const route = await mockApi.getRoute((await redToExpo()).routeId);
    expect(route.stops).toHaveLength(31);
    expect(route.stops[0]).toMatchObject({ name: 'Centrepoint Metro Station', fareZone: '5', secondsFromOrigin: 0, fareFromOrigin: 0 });
    expect(route.stops.at(-1)).toMatchObject({ name: 'Expo 2020 Metro Station', fareFromOrigin: 7.5 });
    expect(route.stops.map((s) => s.name)).toContain('Burj Khalifa/Dubai Mall Metro Station');
  });

  it('times arrivals from the timetable: a departure in Dubai time plus the running time to the stop', async () => {
    const route = await mockApi.getRoute((await redToExpo()).routeId);
    const stop = route.stops[14];
    const list = await mockApi.getArrivals(route.routeId, stop.stopId);
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((a) => a.scheduled)).toBe(true);
    const departures = (await mockApi.adminTrips(new Date().toISOString().slice(0, 10), route.routeId)).map((t) => t.startTime);
    const tomorrow = (await mockApi.adminTrips(new Date(Date.now() + 86400000).toISOString().slice(0, 10), route.routeId)).map((t) => t.startTime);
    const starts = new Set([...departures, ...tomorrow]);
    for (const a of list) expect(starts.has(new Date(new Date(a.eta).getTime() - stop.secondsFromOrigin! * 1000).toISOString())).toBe(true);
  });

  it('charges by fare zones in dirhams', async () => {
    const route = await mockApi.getRoute((await redToExpo()).routeId);
    const [trip] = await mockApi.getArrivals(route.routeId, route.stops[0].stopId);
    const zone5 = route.stops.filter((s) => s.fareZone === '5');
    const near = await mockApi.getTicket((await mockApi.createTicket({ tripId: trip.tripId, boardStopId: route.stops[0].stopId, alightStopId: zone5.at(-1)!.stopId })).ticketId);
    expect(near).toMatchObject({ fare: 3, currency: 'AED', routeNo: 'Red' });
    const far = await mockApi.getTicket((await mockApi.createTicket({ tripId: trip.tripId, boardStopId: route.stops[0].stopId, alightStopId: route.stops.at(-1)!.stopId })).ticketId);
    expect(far.fare).toBe(7.5);
  });

  it('puts running vehicles on the map along the route', async () => {
    const route = await redToExpo();
    const detail = await mockApi.getRoute(route.routeId);
    const lats = detail.stops.map((s) => s.latitude);
    for (const v of await mockApi.getVehicles(route.routeId)) {
      expect(v.lat).toBeGreaterThanOrEqual(Math.min(...lats) - 0.01);
      expect(v.lat).toBeLessThanOrEqual(Math.max(...lats) + 0.01);
      expect(v.regNo).toMatch(/^DXB-MRED1A-\d\d$/);
    }
  });
});

describe('fares and times by region', () => {
  const stops = [
    { stopId: 1, name: 'A', latitude: 0, longitude: 0, stopSequence: 1, fareFromOrigin: 0, fareZone: '5' },
    { stopId: 2, name: 'B', latitude: 0, longitude: 0, stopSequence: 2, fareFromOrigin: 30, fareZone: '6' },
    { stopId: 3, name: 'C', latitude: 0, longitude: 0, stopSequence: 3, fareFromOrigin: 80, fareZone: '2' },
  ];

  it('uses zone fares where the route has them, else the difference of stop fares', () => {
    expect(fareBetween({ zoneFares: [3, 5, 7.5] }, stops, stops[0], stops[1])).toBe(5);
    expect(fareBetween({ zoneFares: [3, 5, 7.5] }, stops, stops[0], stops[2])).toBe(7.5);
    expect(fareBetween({ zoneFares: null }, stops, stops[1], stops[2])).toBe(50);
  });

  it('formats rupees and dirhams', () => {
    expect(formatFare(120)).toBe('Rs. 120');
    expect(formatFare(7.5, 'AED')).toBe('AED 7.50');
    expect(formatFare(3, 'AED')).toBe('AED 3');
  });

  it("shows a time on the route's own clock", () => {
    const iso = '2026-03-02T04:00:00Z';
    expect(formatClock(iso, 'Asia/Dubai')).toMatch(/08:00|8:00/);
    expect(formatClock(iso, 'Asia/Colombo')).toMatch(/09:30|9:30/);
  });

  it('names a route by its number and destination', () => {
    expect(routeLabel({ routeNo: 'Red', destination: 'Expo 2020' })).toBe('Red to Expo 2020');
  });
});
