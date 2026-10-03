# UI Guide: Theme and Navigation Shell

How the shared look and navigation are set up, so every member builds screens the same way.

## Theme

All design tokens live in [`src/constants/theme.ts`](../../src/constants/theme.ts). Do not hard-code colours or spacing in screens; import them.

The look follows the **Milestone 2 high-fidelity prototype** (group report, section 4): dark navy headers, bright blue actions, white rounded cards and green or amber status pills. The values were read from the prototype images in that report; check them against the Figma file and change `theme.ts` if a value differs.

| Token | Value / use |
|---|---|
| `colors.navy` | `#0F2040` header band, tab bar, landing screen |
| `colors.primary` / `primaryDark` | `#2563EB` active chips and highlights / `#1E40AF` main buttons |
| `colors.background`, `surface`, `surfaceAlt` | `#F8FAFC` page, `#FFFFFF` cards, `#EFF6FF` selected card and icon tiles |
| `colors.text`, `textMuted`, `border` | `#0F2040`, `#64748B`, `#E2E8F0` |
| `colors.success` / `successBg` | `#16A34A` / `#DCFCE7` (ON TIME pill) |
| `colors.warning` / `warningBg` | `#B45309` / `#FEF3C7` (DELAYED pill, alerts) |
| `roleColors` | passenger `#2563EB`, conductor `#4F46E5`, authority `#0F766E` |
| `spacing` | `xs 4`, `sm 8`, `md 16`, `lg 24`, `xl 32` |
| `radius` | `sm 8`, `md 12`, `lg 16`, `xl 24`, `pill 999` |
| `theme` / `createTheme(accent)` | React Native Paper (Material 3) theme built from the tokens |

`PaperProvider` wraps the whole app in [`src/app/_layout.tsx`](../../src/app/_layout.tsx), so Paper components (`Button`, `TextInput`, `Chip`, `Text`) pick up the theme automatically. The status bar text is light because every screen starts with the navy header.

## Shared components

| Component | File | Use |
|---|---|---|
| `Screen` | `src/components/ui/screen.tsx` | Page wrapper. With `title` it draws the navy header and a light body with rounded top corners. Props: `title`, `subtitle`, `back` (round back button), `headerRight`, `headerExtra` (content inside the navy band, such as the Home search card), `landing` (full navy page), `scroll`. |
| `SurfaceCard` | `src/components/ui/surface-card.tsx` | The white rounded card for every list item and panel; pass `onPress` to make it tappable. |
| `StatusPill` | `src/components/ui/status-pill.tsx` | ON TIME (green) or DELAYED (amber) pill. |
| `SectionHeader` | `src/components/ui/section-header.tsx` | Title row for a block of content. |
| `RoleTabs` | `src/components/navigation/role-tabs.tsx` | Dark navy bottom tab bar used by the three role layouts. |
| `SearchForm` | `src/components/search/search-form.tsx` | Journey search card (Bus or Train toggle, From, Destination, travel date, preferred time, search button). Used on Home and on the Search tab. |
| `RouteTimeline`, `FacilityChips`, `TripSummaryCard` | `src/components/trip/` | Trip screens: stop list with dots and times, facility chips with icons, vehicle and status header card. |
| `PlaceholderScreen` | `src/components/ui/placeholder-screen.tsx` | Temporary body for a screen that is not built yet. Delete its use when you build the real screen. |

Example screen:

```tsx
import { Screen } from '@/components/ui/screen';

export default function SearchScreen() {
  return (
    <Screen title="Search Transport" subtitle="Find the best journey for you." back>
      {/* your content */}
    </Screen>
  );
}
```

## Navigation shell

```
src/app/
├── _layout.tsx            Root: SafeAreaProvider, PaperProvider, Stack
├── index.tsx              Temporary role picker (replaced by real sign-in)
├── (passenger)/           Stack: select-transport, then (tabs)
│   ├── select-transport   Choose bus or train (first screen)
│   └── (tabs)/            Tabs: Home, Search, Tickets, Profile
├── (conductor)/           Tabs: Dashboard, Scan, Passengers, Report
└── (authority)/           Tabs: Dashboard, Vehicles, Live, Alerts
```

- The entry screen offers "Continue as Passenger / Conductor / Authority". Real login will read `users/{uid}.role` and route to the matching group.
- Each role group has its own `_layout.tsx` that declares its tabs through `RoleTabs`.
- Each tab currently shows a `PlaceholderScreen` naming its owner and requirements. The owner replaces the file with the real screen.

### Adding a screen

1. Create the file in your role group, for example `src/app/(passenger)/results.tsx`.
2. Any file under the group that is not listed in the group's `tabs` array becomes a normal route reachable by navigation, but Expo Router will still add it to the tab bar unless it is hidden. For non-tab screens, put them in a sub-folder with its own `_layout.tsx` (a Stack), for example `(passenger)/booking/_layout.tsx`, or set `href: null` for them in the group's `_layout.tsx`.
3. Link to it with `router.push('/results')` or `<Link href="/results">`.
4. Wrap content in `Screen` and take colours and spacing from `theme.ts`.

### Adding a tab

Add an entry to the `tabs` array in the role's `_layout.tsx` (name = file name, title, Ionicons icon name) and create the matching file.

## Transport type (bus or train)

- `src/constants/transport.ts`: `TransportType`, labels, icons and colours (bus orange, train teal).
- `src/store/transport-store.ts`: `useTransportStore()` gives `transport` (`'bus' | 'train' | null`), `setTransport` and `clearTransport`.
- `src/components/transport/transport-badge.tsx`: `TransportBadge` pill to show the current choice.
- In any passenger screen that lists vehicles, read `transport` and filter your data by it:

```tsx
const transport = useTransportStore((s) => s.transport);
// e.g. query(collection(db, 'routes'), where('type', '==', transport))
```

- Route paths: URLs ignore group names, but links use the group form, for example `router.push('/(passenger)/(tabs)/search')`. Run `npx expo start` once after adding a screen so route types regenerate.

## Passenger Home building blocks

| Piece | File | Purpose |
|---|---|---|
| `SectionHeader` | `src/components/ui/section-header.tsx` | Title row for a block of content |
| `VehicleCard` | `src/components/home/vehicle-card.tsx` | Vehicle number, route, next stop, minutes to arrive, on time or delayed |
| `RouteCard` | `src/components/home/route-card.tsx` | Route with fare and a bookmark button to save or remove it |
| `AlertCard` | `src/components/home/alert-card.tsx` | Authority alert with age |
| `useSavedRoutesStore` | `src/store/saved-routes-store.ts` | Saved route ids, kept on the device |
| `home-data.ts` | `src/lib/home-data.ts` | Functions that return vehicles, routes and alerts for a transport type |

Home currently reads `src/data/sample-data.ts`. To go live, change only the function bodies in `home-data.ts` to Firestore queries; the screen does not change.

## Conventions

- TypeScript strict mode; run `npm run typecheck` before opening a PR.
- Import with the `@/` alias (maps to `src/`).
- Use `npx expo install <package>` for new packages so versions match the SDK.
