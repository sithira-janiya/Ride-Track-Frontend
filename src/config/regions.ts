import type { Region } from '@/types';

import { env } from './env';

/** More than one region in this build: show region pickers and labels. With one, they would only say "Sri Lanka". */
export const multiRegion = env.regions.length > 1;

/** The region to ask the server for when the screen does not choose one: the only one, or all of them. */
export const defaultRegion: Region | undefined = multiRegion ? undefined : env.regions[0];

/** Whether something in `region` belongs in this build. Items without a region are Sri Lankan (older servers). */
export const inBuildRegions = (region: Region | undefined) => env.regions.includes(region ?? 'SRI_LANKA');
