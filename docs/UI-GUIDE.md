# UI Guide: Theme and Navigation Shell

How the shared look and navigation are set up, so every member builds screens the same way.

## Theme

All design tokens live in [`src/constants/theme.ts`](../src/constants/theme.ts). Do not hard-code colours or spacing in screens; import them.

| Token | Use |
|---|---|
| `colors` | Brand, background, surface, text, border, success, warning, error |
| `roleColors` | Accent per role: passenger blue `#1565C0`, conductor green `#2E7D32`, authority purple `#6A1B9A` |
| `spacing` | `xs 4`, `sm 8`, `md 16`, `lg 24`, `xl 32` |
| `radius` | `sm 6`, `md 12`, `lg 20` |
| `theme` / `createTheme(accent)` | React Native Paper (Material 3) theme built from the tokens |

`PaperProvider` wraps the whole app in [`src/app/_layout.tsx`](../src/app/_layout.tsx), so Paper components (`Button`, `Card`, `TextInput`, `Text`) pick up the theme automatically.

> The colours are a starting palette. They have not yet been checked against the Figma hi-fi prototype. Align the values in `theme.ts` with the Figma tokens; screens will follow without code changes.

## Shared components

| Component | File | Use |
|---|---|---|
| `Screen` | `src/components/screen.tsx` | Page wrapper: safe area, background, padding, optional title and subtitle. Use for every screen. |
| `RoleTabs` | `src/components/role-tabs.tsx` | Bottom tab bar tinted with the role colour. Used by the three role layouts. |
| `PlaceholderScreen` | `src/components/placeholder-screen.tsx` | Temporary body for a screen that is not built yet. Delete its use when you build the real screen. |

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
├── (passenger)/           Tabs: Home, Search, Tickets, Profile
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

## Conventions

- TypeScript strict mode; run `npm run typecheck` before opening a PR.
- Import with the `@/` alias (maps to `src/`).
- Use `npx expo install <package>` for new packages so versions match the SDK.
