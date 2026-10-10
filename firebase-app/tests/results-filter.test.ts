import assert from 'node:assert/strict';
import { test } from 'node:test';

import { defaultResultsFilter, type ResultsFilter } from '@/constants/results';
import { toMinutes } from '@/lib/format';
import { activeFilterCount, filterAndSort, periodOf } from '@/lib/results-filter';
import { getResults } from '@/lib/search-data';

/** Case ids (F29 and so on) are the functional cases in docs/process/TESTING.md. */

const filter = (changes: Partial<ResultsFilter>): ResultsFilter => ({ ...defaultResultsFilter, ...changes });
const busTrips = getResults('bus', 'Colombo', 'Kandy');
const trainTrips = getResults('train', 'Colombo Fort', 'Badulla');

test('F29: Colombo to Kandy lists the four Route 1 trips, earliest first', () => {
  const shown = filterAndSort(busTrips, defaultResultsFilter);
  assert.equal(shown.length, 4);
  assert.ok(shown.every((r) => r.route.id === 'r-bus-1'));
  const times = shown.map((r) => toMinutes(r.schedule.departure));
  assert.deepEqual(times, [...times].sort((a, b) => a - b));
});

test('F32: cheapest sorts by fare, then by departure', () => {
  const all = [...busTrips, ...getResults('bus', 'Colombo', 'Galle'), ...getResults('bus', 'Colombo', 'Negombo')];
  const shown = filterAndSort(all, filter({ sort: 'cheapest' }));
  const fares = shown.map((r) => r.route.fare);
  assert.ok(new Set(fares).size > 1, 'the sample mixes several fares');
  assert.deepEqual(fares, [...fares].sort((a, b) => a - b));
  assert.equal(shown[0].route.id, 'r-bus-240');
});

test('F33: shortest trip sorts by travel time', () => {
  const shown = filterAndSort(busTrips, filter({ sort: 'fastest' }));
  const durations = shown.map((r) => r.schedule.durationMinutes);
  assert.deepEqual(durations, [...durations].sort((a, b) => a - b));
});

test('F34: On time only removes delayed trips and counts as one filter', () => {
  assert.ok(busTrips.some((r) => r.schedule.status === 'delayed'));
  const f = filter({ onTimeOnly: true });
  const shown = filterAndSort(busTrips, f);
  assert.ok(shown.length > 0 && shown.length < busTrips.length);
  assert.ok(shown.every((r) => r.schedule.status === 'on-time'));
  assert.equal(activeFilterCount(f), 1);
});

test('F35: Evening and Night keep only trips leaving 5 pm to 5 am', () => {
  const shown = filterAndSort(busTrips, filter({ periods: ['evening', 'night'] }));
  assert.ok(shown.length > 0);
  for (const r of shown) {
    const hour = Math.floor(toMinutes(r.schedule.departure) / 60);
    assert.ok(hour >= 17 || hour < 5, `${r.schedule.departure} is not evening or night`);
  }
});

test('F36: filters that match nothing give an empty list', () => {
  const shown = filterAndSort(busTrips, filter({ maxFare: 500, duration: 'short' }));
  assert.equal(shown.length, 0);
});

test('F37: the default filter is no filters, sorted by earliest', () => {
  assert.equal(activeFilterCount(defaultResultsFilter), 0);
  assert.equal(defaultResultsFilter.sort, 'earliest');
});

test('F47: Up to Rs. 500 keeps only routes costing Rs. 500 or less', () => {
  const both = [...busTrips, ...trainTrips];
  const shown = filterAndSort(both, filter({ maxFare: 500 }));
  assert.ok(shown.length > 0);
  assert.ok(shown.every((r) => r.route.fare <= 500));
  assert.ok(shown.length < both.length);
});

test('F48: duration bands are Under 2 h, 2 to 4 h and Over 4 h', () => {
  const trips = [...busTrips, ...trainTrips, ...getResults('bus', 'Colombo', 'Negombo')];
  for (const [band, test_] of [
    ['short', (m: number) => m < 120],
    ['medium', (m: number) => m >= 120 && m < 240],
    ['long', (m: number) => m >= 240],
  ] as const) {
    const shown = filterAndSort(trips, filter({ duration: band }));
    assert.ok(shown.length > 0, `${band} has trips`);
    assert.ok(shown.every((r) => test_(r.schedule.durationMinutes)), `${band} band is respected`);
  }
});

test('periodOf: boundaries of the four departure windows', () => {
  assert.equal(periodOf('04:59'), 'night');
  assert.equal(periodOf('05:00'), 'morning');
  assert.equal(periodOf('11:59'), 'morning');
  assert.equal(periodOf('12:00'), 'afternoon');
  assert.equal(periodOf('17:00'), 'evening');
  assert.equal(periodOf('21:00'), 'night');
  assert.equal(periodOf('00:30'), 'night');
});

test('filterAndSort does not change the list it is given', () => {
  const before = busTrips.map((r) => r.schedule.id);
  filterAndSort(busTrips, filter({ sort: 'cheapest', onTimeOnly: true }));
  assert.deepEqual(busTrips.map((r) => r.schedule.id), before);
});
