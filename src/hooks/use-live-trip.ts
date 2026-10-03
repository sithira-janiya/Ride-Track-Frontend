import { useEffect, useRef, useState } from 'react';

import { tripFraction } from '@/lib/vehicle-position';
import type { TripDetail } from '@/types/models';

/** How often a real-clock position refreshes, in seconds. */
const REFRESH_SECONDS = 5;
/** How long the demo simulation takes to drive the whole trip, in seconds. */
const SIMULATION_SECONDS = 90;

function clockMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
}

/**
 * Share of the trip completed, kept up to date.
 * Normally follows the phone clock against the timetable and refreshes every few seconds.
 * With `simulate` on it drives the trip from start to end in about 90 seconds so the movement
 * can be seen at any time of day. Sample data has no GPS; the backend will replace this.
 */
export function useLiveTrip(detail: TripDetail | undefined, simulate: boolean) {
  const [fraction, setFraction] = useState(() => (detail ? tripFraction(detail, clockMinutes()) : 0));
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  const simulated = useRef(0);
  const lastUpdate = useRef(Date.now());

  // Refresh the position.
  useEffect(() => {
    if (!detail) return;
    if (simulate) simulated.current = 0;

    const update = () => {
      if (simulate) {
        simulated.current = Math.min(1, simulated.current + 1 / SIMULATION_SECONDS);
        setFraction(simulated.current);
      } else {
        setFraction(tripFraction(detail, clockMinutes()));
      }
      lastUpdate.current = Date.now();
      setSecondsSinceUpdate(0);
    };

    update();
    const id = setInterval(update, (simulate ? 1 : REFRESH_SECONDS) * 1000);
    return () => clearInterval(id);
  }, [detail, simulate]);

  // Count the seconds since the last refresh for the "updated Ns ago" label.
  useEffect(() => {
    const id = setInterval(() => setSecondsSinceUpdate(Math.round((Date.now() - lastUpdate.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  return { fraction, secondsSinceUpdate };
}
