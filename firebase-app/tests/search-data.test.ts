import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildResults,
  getPlaces,
  getResults,
  placesFromRoutes,
  routesBetween,
  suggestPlaces,
} from '@/lib/search-data';
import { sampleRoutes, sampleSchedules, sampleVehicles } from '@/data/sample-data';
import type { Route, Schedule } from '@/types/models';

/** Case ids (F19 and so on) are the functional cases in docs/process/TESTING.md. */

test('F19: typing "col" suggests Colombo for buses and Colombo Fort for trains only', () => {
  assert.deepEqual(suggestPlaces(getPlaces('bus'), 'col'), ['Colombo']);
  assert.deepEqual(suggestPlaces(getPlaces('train'), 'col'), ['Colombo Fort']);
});

test('F19: suggestions never mix transports', () => {
  assert.ok(!getPlaces('bus').includes('Badulla'));
  assert.ok(!getPlaces('train').includes('Kandy'));
});

test('suggestions: an empty or blank query suggests nothing', () => {
  assert.deepEqual(suggestPlaces(getPlaces('bus'), ''), []);
  assert.deepEqual(suggestPlaces(getPlaces('bus'), '   '), []);
});

test('F22: the other box\'s place is left out of the suggestions', () => {
  assert.deepEqual(suggestPlaces(getPlaces('bus'), 'k', 'Kandy'), []);
  assert.deepEqual(suggestPlaces(getPlaces('bus'), 'k', ' kandy '), []);
});

test('placesFromRoutes: no duplicates, sorted A to Z, blanks ignored', () => {
  const routes = [
    { from: 'Galle', to: 'Colombo' },
    { from: 'Colombo', to: 'Kandy' },
    { from: '', to: 'Kandy' },
  ] as Route[];
  assert.deepEqual(placesFromRoutes(routes), ['Colombo', 'Galle', 'Kandy']);
});

test('F30: the reverse direction finds the same trips', () => {
  const forward = getResults('bus', 'Colombo', 'Kandy').map((r) => r.schedule.id);
  const reverse = getResults('bus', 'Kandy', 'Colombo').map((r) => r.schedule.id);
  assert.ok(forward.length > 0);
  assert.deepEqual(reverse, forward);
});

test('F31: a pair with no route gives no trips', () => {
  assert.deepEqual(getResults('bus', 'Colombo', 'Jaffna'), []);
  assert.deepEqual(getResults('bus', 'Atlantis', 'Kandy'), []);
});

test('F39: buses and trains never mix in Results', () => {
  assert.equal(getResults('train', 'Colombo', 'Kandy').length, 0);
  assert.equal(getResults('bus', 'Colombo Fort', 'Badulla').length, 0);
  assert.ok(getResults('train', 'Colombo Fort', 'Badulla').every((r) => r.route.type === 'train'));
});

test('Results carry the trip, its route and its vehicle', () => {
  const [first] = getResults('bus', 'Colombo', 'Kandy');
  assert.equal(first.route.id, first.schedule.routeId);
  assert.equal(first.vehicle?.id, first.schedule.vehicleId);
});

test('buildResults (live data path): joins schedules to routes between the two places', () => {
  const schedules: Schedule[] = [
    { ...sampleSchedules[0], id: 'live-1' },
    { ...sampleSchedules.find((s) => s.routeId === 'r-bus-2')!, id: 'live-2' },
  ];
  const results = buildResults(sampleRoutes, schedules, sampleVehicles, 'Colombo', 'Kandy');
  assert.deepEqual(results.map((r) => r.schedule.id), ['live-1']);
  assert.equal(results[0].vehicle?.number, 'NB-4521');
});

test('buildResults: a schedule whose route is not loaded is skipped, a missing vehicle is allowed', () => {
  const orphan: Schedule = { ...sampleSchedules[0], id: 'orphan', routeId: 'r-unknown' };
  assert.deepEqual(buildResults(sampleRoutes, [orphan], sampleVehicles, 'Colombo', 'Kandy'), []);
  const noVehicle = buildResults(sampleRoutes, [sampleSchedules[0]], [], 'Colombo', 'Kandy');
  assert.equal(noVehicle.length, 1);
  assert.equal(noVehicle[0].vehicle, undefined);
});

test('routesBetween: matches partial, case-insensitive names', () => {
  assert.equal(routesBetween(sampleRoutes, 'colo', 'kan').length, 1);
  assert.equal(routesBetween(sampleRoutes, 'COLOMBO', 'GALLE')[0].id, 'r-bus-2');
});
