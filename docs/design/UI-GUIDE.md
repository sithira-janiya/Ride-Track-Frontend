# UI Guide: Theme and Navigation Shell

How the shared look and navigation are set up, so every member builds screens the same way.

## Theme

All design tokens live in [`src/constants/theme.ts`](../../src/constants/theme.ts). Do not hard-code colours or spacing in screens; import them.

| Token | Use |
|---|---|
| `colors` | Brand, background, surface, text, border, success, warning, error |
| `roleColors` | Accent per role: passenger blue `#1565C0`, conductor green `#2E7D32`, authority purple `#6A1B9A` |
| `spacing` | `xs 4`, `sm 8`, `md 16`, `lg 24`, `xl 32` |
| `radius` | `sm 6`, `md 12`, `lg 20` |
| `theme` / `createTheme(accent)` | React Native Paper (Material 3) theme built from the tokens |

`PaperProvider` wraps the whole app in [`src/app/_layout.tsx`](../../src/app/_layout.tsx), so Paper components (`Button`, `Card`, `TextInput`, `Text`) pick up the theme automatically.

> The colours are a starting palette. They have not yet been checked against the Figma hi-fi prototype. Align the values in `theme.ts` with the Figma tokens; screens will follow without code changes.

## Shared components

| Component | File | Use |
|---|---|---|
| `Screen` | `src/components/ui/screen.tsx` | Page wrapper: safe area, background, padding, optional title and subtitle. Use for every screen. |
| `RoleTabs` | `src/components/navigation/role-tabs.tsx` | Bottom tab bar tinted with the role colour. Used by the three role layouts. |
| `PlaceholderScreen` | `src/components/ui/placeholder-screen.tsx` | Temporary body for a screen that is not built yet. Delete its use when you build the real screen. |

Example screen:

```tsx
import { Screen } from '@/components/screen';

export default function SearchScreen() {
  return (
    <Screen title="Search">
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
