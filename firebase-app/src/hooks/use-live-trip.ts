import { useEffect, useRef, useState } from 'react';

import { fractionOnRoute, tripFraction } from '@/lib/vehicle-position';
import type { TripDetail } from '@/types/models';

/** How often a timetable position refreshes, in seconds. */
const REFRESH_SECONDS = 5;
/** How long the demo simulation takes to drive the whole trip, in seconds. */
const SIMULATION_SECONDS = 90;
/** A GPS position older than this is treated as stale and the timetable is used instead. */
const FRESH_MS = 2 * 60 * 1000;

function clockMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
}

/**
 * Share of the trip completed, kept up to date.
 * Uses the vehicle's real GPS position from Firestore (`vehicle.location`) while it is fresh
 * (updated in the last 2 minutes). Otherwise it follows the phone clock against the timetable,
 * refreshing every few seconds. With `simulate` on it drives the trip from start to end in about
 * 90 seconds so the movement can be seen at any time of day.
 * `isLive` is true while the position comes from GPS.
 */
export function useLiveTrip(detail: TripDetail | undefined, simulate: boolean) {
  const [fraction, setFraction] = useState(() => (detail ? tripFraction(detail, clockMinutes()) : 0));
  const [isLive, setIsLive] = useState(false);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  const simulated = useRef(0);
  const lastUpdate = useRef(0); // set on mount; reading the clock during render is impure

  // Refresh the position. Runs again when the trip or its vehicle document changes.
  useEffect(() => {
    if (!detail) return;
    if (simulate) simulated.current = 0;
    const location = detail.vehicle.location;

    const update = () => {
      const gpsFresh = !simulate && location !== undefined && location.updatedAt > 0 && Date.now() - location.updatedAt < FRESH_MS;
      if (simulate) {
        simulated.current = Math.min(1, simulated.current + 1 / SIMULATION_SECONDS);
        setFraction(simulated.current);
      } else if (gpsFresh && location) {
        setFraction(fractionOnRoute(detail.route.stops, location));
      } else {
        setFraction(tripFraction(detail, clockMinutes()));
      }
      setIsLive(gpsFresh);
      lastUpdate.current = gpsFresh && location ? location.updatedAt : Date.now();
      setSecondsSinceUpdate(Math.max(0, Math.round((Date.now() - lastUpdate.current) / 1000)));
    };

    update();
    const id = setInterval(update, (simulate ? 1 : REFRESH_SECONDS) * 1000);
    return () => clearInterval(id);
  }, [detail, simulate]);

  // Count the seconds since the last update for the "updated Ns ago" label.
  useEffect(() => {
    if (!lastUpdate.current) lastUpdate.current = Date.now();
    const id = setInterval(() => setSecondsSinceUpdate(Math.max(0, Math.round((Date.now() - lastUpdate.current) / 1000))), 1000);
    return () => clearInterval(id);
  }, []);

  return { fraction, secondsSinceUpdate, isLive };
}
