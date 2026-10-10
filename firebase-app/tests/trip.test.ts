import assert from 'node:assert/strict';
import { test } from 'node:test';

import { toMinutes } from '@/lib/format';
import { buildTripDetail, getTripDetail } from '@/lib/trip-data';
import { getTripProgress } from '@/lib/trip-progress';
import { fractionOnRoute, positionAt, tripFraction } from '@/lib/vehicle-position';
import { sampleRoutes, sampleSchedules, sampleVehicles } from '@/data/sample-data';

/** Case ids (F58 and so on) are the functional cases in docs/process/TESTING.md. */

// s-b1-2 leaves 08:15 and takes 200 minutes (arrives 11:35).
const detail = getTripDetail('s-b1-2')!;
const start = toMinutes('08:15');
const end = start + 200;

test('F61: an unknown trip id gives no detail', () => {
  assert.equal(getTripDetail('does-not-exist'), undefined);
});

test('F53: trip detail has the schedule, route, vehicle and a time at every stop', () => {
  assert.equal(detail.route.id, 'r-bus-1');
  assert.equal(detail.vehicle.id, 'v-1');
  assert.equal(detail.stopTimes.length, detail.route.stops.length);
  assert.equal(detail.stopTimes[0].time, '08:15');
  assert.equal(detail.stopTimes[detail.stopTimes.length - 1].time, '11:35');
});

test('buildTripDetail (live data path) gives the same result as the sample lookup', () => {
  const schedule = sampleSchedules.find((s) => s.id === 's-b1-2')!;
  const route = sampleRoutes.find((r) => r.id === schedule.routeId)!;
  const vehicle = sampleVehicles.find((v) => v.id === schedule.vehicleId)!;
  assert.deepEqual(buildTripDetail(schedule, route, vehicle), detail);
});

test('F58: before departure every stop is Upcoming and the card says when it leaves', () => {
  const progress = getTripProgress(detail, start - 30);
  assert.equal(progress.phase, 'not-started');
  assert.ok(progress.stopStates.every((s) => s === 'upcoming'));
  assert.match(progress.summary, /Not departed yet\. Leaves in 30m/);
});

test('F59: during the trip passed stops are Departed and the next stop has minutes to go', () => {
  const progress = getTripProgress(detail, start + 100);
  assert.equal(progress.phase, 'in-progress');
  assert.equal(progress.stopStates[0], 'departed');
  assert.equal(progress.stopStates[progress.stopStates.length - 1], 'upcoming');
  assert.match(progress.summary, /^Between .+ and .+\.$/);
  assert.ok((progress.etaMinutes ?? 0) > 0);
});

test('F60: after the trip every stop is Arrived and the journey is completed', () => {
  const progress = getTripProgress(detail, end + 1);
  assert.equal(progress.phase, 'completed');
  assert.ok(progress.stopStates.every((s) => s === 'arrived'));
  assert.equal(progress.summary, 'Journey completed.');
});

test('F71: tripFraction is 0 before departure, 1 after arrival, 0.5 halfway', () => {
  assert.equal(tripFraction(detail, start - 60), 0);
  assert.equal(tripFraction(detail, end + 60), 1);
  assert.ok(Math.abs(tripFraction(detail, start + 100) - 0.5) < 1e-9);
});

test('positionAt: starts at the first stop and ends at the last', () => {
  const { stops } = detail.route;
  assert.deepEqual(positionAt(stops, 0), { latitude: stops[0].lat, longitude: stops[0].lng });
  const last = stops[stops.length - 1];
  assert.deepEqual(positionAt(stops, 1), { latitude: last.lat, longitude: last.lng });
});

test('F3 (live GPS): fractionOnRoute maps a GPS point back to the share of the trip', () => {
  const { stops } = detail.route;
  assert.equal(fractionOnRoute(stops, { lat: stops[0].lat, lng: stops[0].lng }), 0);
  for (const stop of stops) {
    assert.ok(Math.abs(fractionOnRoute(stops, { lat: stop.lat, lng: stop.lng }) - stop.at) < 1e-6, stop.name);
  }
});

test('F3 (live GPS): a point slightly off the line still snaps to a sensible spot', () => {
  const { stops } = detail.route;
  const half = positionAt(stops, 0.5);
  const fraction = fractionOnRoute(stops, { lat: half.latitude + 0.01, lng: half.longitude + 0.01 });
  assert.ok(Math.abs(fraction - 0.5) < 0.05);
});

test('fractionOnRoute and positionAt agree: going out and back gives the same share', () => {
  const { stops } = detail.route;
  for (const f of [0.1, 0.3, 0.62, 0.9]) {
    const p = positionAt(stops, f);
    assert.ok(Math.abs(fractionOnRoute(stops, { lat: p.latitude, lng: p.longitude }) - f) < 1e-6, String(f));
  }
});
