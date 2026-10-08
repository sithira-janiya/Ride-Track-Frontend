# RideTrack Frontend

Mobile app for RideTrack, a public transport (bus and train) tracking and ticketing system. One React Native app serves three kinds of user; the screens shown depend on the logged-in user's role: **Passenger**, **Staff** (conductor/inspector) and **Authority**.

> This file is kept up to date as the app is built. See [Keeping this README current](#keeping-this-readme-current).

## Tech stack

| Concern | Choice |
|---|---|
| Framework | React Native + Expo SDK 57 (managed workflow), TypeScript |
| Navigation | Expo Router (file-based, routes in `src/app/`) |
| Server state | TanStack Query |
| Client state | Zustand (auth, favourites, ticket cache, language) |
| Translation | Google Cloud Translation API (v2, Basic) over `fetch` |
| HTTP / real-time | Axios, socket.io-client |
| Maps | react-native-maps (native only; web shows a notice) |
| Tickets / scanning | react-native-qrcode-svg, expo-brightness, expo-web-browser, expo-camera, expo-haptics |
| Alerts | expo-notifications (push registration), socket `alert:new` |
| Storage | expo-secure-store (tokens), AsyncStorage (favourites, ticket cache, offline route cache, language and translations) |
| Forms | React Hook Form |

## Getting started

```bash
npm install
cp .env.example .env.local   # then edit if needed
npx expo start               # scan the QR code with Expo Go, or press w for web
```

To show the app in Sinhala or Tamil, set `EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY` in `.env.local` (see [Languages](#languages-google-translate)). Without it the app stays in English.

By default the app runs against a **built-in mock API** (`EXPO_PUBLIC_USE_MOCK_API=true`), so no backend is needed. Set it to `false` and point `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_SOCKET_URL` at the real backend to use live data.

### Running against the real backend (RideTrack-API)

The backend lives in the `RideTrack-API` repo (Node, Express, MySQL, Socket.IO). Most endpoints the app calls have been checked against it: login, routes, arrivals, nearby stops, buying and paying for a ticket (mock gateway), staff scan, alerts, the ops dashboard, reports and the admin panel (see [Known limitations](#known-limitations) for the rest).

1. In `RideTrack-API`: start MySQL, then run `npm run migrate`, `npm run seed` and `npm run dev` (see its README). Check `http://<host>:3000/health` returns `{"status":"ok"}`.
2. In this app's `.env.local`, set `EXPO_PUBLIC_USE_MOCK_API=false` and point both URLs at the computer running the API:
   - web or iOS simulator: `http://localhost:3000/api/v1` and `http://localhost:3000`
   - a phone on the same Wi-Fi: the computer's LAN IP (`ipconfig` on Windows), e.g. `http://10.116.186.92:3000/api/v1`
3. Restart with `npx expo start -c`, because `EXPO_PUBLIC_*` values are built in at bundle time.

Notes:
- The LAN IP changes when you switch networks. If the app shows "Cannot reach RideTrack", update the IP here **and** `PUBLIC_URL` in the backend's `.env` (it is used for payment page links).
- Live vehicles only appear while something sends GPS positions: run `npm run simulate` in `RideTrack-API`.
- Passengers only receive an alert when they hold a pending or active ticket for that trip.
- The EAS `development` and `preview` profiles force mock mode; only `production` uses the real API.

### Demo accounts

All use the password `Password1!`.

| Role | Email | Lands on |
|---|---|---|
| Passenger | `passenger@ridetrack.test` | Passenger tabs (home, tickets, alerts, profile) |
| Staff | `staff@ridetrack.test` | Staff tabs (scan, passengers, shift) |
| Authority | `officer@ridetrack.test` | Authority tabs (dashboard, fleet, reports, alerts) |

Notes:
- In mock mode these accounts are defined in `src/api/mock.ts` (`users` and `MOCK_PASSWORD`). On the real backend the same accounts and password are created by `npm run seed` in `RideTrack-API`.
- The login field accepts an email or a mobile number, but the demo accounts have no phone number, so log in with the email.
- Registering in the app always creates a **Passenger**. Staff and Authority accounts cannot be self-registered.
- In mock mode, registered accounts live in memory only and disappear when the app reloads. On the real backend they are saved in MySQL.
- A wrong email or wrong password gives the same error, "Invalid email/phone or password."
- Passwords need at least 8 characters with a letter and a number when registering.

### Useful commands

```bash
npx tsc --noEmit    # typecheck
npx expo lint       # lint
npx expo-doctor     # check dependencies and config
npm test            # run the automated tests (Jest)
```

Run typecheck and lint before committing. Add packages with `npx expo install <package>`, not `npm install`, so versions match the SDK.

## Project status

Phases follow [`docs/11-frontend-tasks.md`](../RideTrack%20Development/docs/11-frontend-tasks.md) in the RideTrack Development repo.

| Phase | Scope | Status |
|---|---|---|
| 0 | Setup: theme, shared UI, API client, mock API | Done |
| 1 | Auth: login, register, session restore, role-based routing | Done |
| 2 | Passenger: route search, nearby stops, route detail, arrivals, favourites | Done |
| 3 | Passenger: live map with real-time vehicles | Done (not yet tested on a device; no marker animation) |
| 4 | Passenger: buy ticket, payment, ticket list, QR, cancel, offline cache | Built, untested on a device; real payment gateway not exercised |
| 5 | Staff: QR scanner, scan result, manual entry, passenger count, shift | Built; manual entry, shift and count checked in the browser; camera scan and haptics not tested on a device |
| 6 | Passenger: alerts, push registration, profile settings | Built; alerts list, unread badge, banner, and profile save checked in the browser; real push and socket alerts not tested |
| 7 | Authority: dashboard, live fleet, reports, alerts | Built; dashboard, fleet filter, reports and publishing an alert checked in the browser; map and real-time updates not tested on a device |
| – | Authority: admin back office (overview, accounts, vehicles, routes, trips, tickets) | Built; every screen checked in the browser against the real backend (create and disable an account, edit a vehicle); not tested on a device |
| 8 | Quality and release | In progress: contrast audit, automated tests and build config done; device, offline and usability testing and the real build still to do |

## Features built so far

**Passenger**
- Search routes (debounced, bus/train filter), nearby stops (asks for location), favourite routes.
- Route detail: ordered stops with fares, upcoming arrivals at a chosen stop.
- Live map: route line, stops and moving vehicles over WebSocket, with arrival time and occupancy (icon and text). Shows "Live / Reconnecting" and an "out of date" warning after 60 s without updates.
- Tickets: pick boarding stop, drop-off stop and trip, see the fare, pay. A pending payment is saved on the device and re-checked when the app resumes, so it is never lost. Ticket list with filters and paging, QR screen with a screen-brightness boost, cancel an unused ticket. Tickets are cached on the device so they still show offline, and cleared on logout.

- Alerts tab: delay, cancellation and route-change alerts with unread highlighting, a tab badge with the unread count, "Mark as read" and "Mark all as read". A banner slides in over any screen when the server sends `alert:new`. The device is registered for push notifications on login (skipped in mock mode, on web, and when notifications are off). In mock mode a "Demo: simulate a new alert" button stands in for the server.
- Profile: edit name, choose language (English, Sinhala, Tamil) and turn alert notifications on or off. Also has Log out. Saving a new language switches the app to it (see Languages below).

**Staff**
- Scan tab: camera permission flow, QR scanning, then a large VALID / INVALID result with the reason (icon, word and colour) and haptic feedback. "Scan next ticket" resets for the next passenger. If a QR will not scan, type the ticket number instead.
- Passengers tab: set the on-board passenger count for the shift's vehicle (+/- 1 and 5), sent to the server with Save.
- Shift tab: choose route and trip (and so the vehicle) for the shift; remembered on the device.

**Authority**
- Dashboard: live tiles (vehicles live, active delays, passengers on board, nearly-full vehicles), active delays and cancellations, and every vehicle with arrival time and occupancy. Refreshes on the server's `ops:update` event (polls every few seconds in mock mode).
- Fleet tab: all vehicles on one map, filterable by route; selecting a card highlights its marker.
- Reports tab: choose report type (route performance, delays, occupancy), route and period (last 7 or 30 days), then see a bar chart and a table.
- Alerts tab: publish a delay, cancellation or route-change alert for a trip, with validation, and review published alerts. In mock mode a published alert also shows up for passengers.
- Admin tab (back office, backed by RideTrack-API `/admin/*`):
  - Overview: today's trips, delays and cancellations, tickets sold and revenue, plus account, vehicle, route and stop counts.
  - Accounts: search by name, email or phone, filter by role, page through results. Add a staff (conductor or inspector, optionally on a vehicle) or authority officer account. Disable an account (asks first; the person is signed out at once) or enable it again. You cannot disable your own account.
  - Vehicles: add a bus or train to a route of the same kind, change its capacity or route, take it out of service or return it.
  - Routes: every route, active or not, with its stop and vehicle counts (read only).
  - Trips: yesterday's, today's or tomorrow's timetable (UTC days), filterable by route, with status and tickets sold.
  - Tickets: every ticket sold, newest first, filterable by status, with passenger, fare and payment status.
  - Admin data is never saved on the device. Opening an admin page directly (web refresh or link) still puts the overview underneath it, so the back arrow works.
- Log out is at the bottom of the Dashboard.

**Offline routes and timetables**: routes, route detail, stop arrivals and nearby stops are saved on the device for 24 hours (`src/app/_layout.tsx`), so they still show without signal. Alerts, tickets and live vehicle positions are not saved here (tickets have their own cache).

**Auth**: email or phone login, register, session restored on app start, role decides which screens appear. The login and register screens have a language picker too.

**Artwork**: RideTrack's own app icon (a bus inside a map pin, in the brand blue), Android adaptive and themed icons, splash screen, web favicon and iOS Liquid Glass icon layers. Flat illustrations show on the login and register screens and on the empty states for no tickets, no alerts (passenger and authority) and no routes or nearby stops (`EmptyState`'s `illustration` prop). The art is original; Pinterest searches for transit app icons and flat transport illustrations were used only as style references. Illustrations are decorative and hidden from screen readers.

### Languages (Google Translate)

The app is written in English and translated at run time with the Google Cloud Translation API (`src/i18n/`).

- `useT()` returns `t(text, params?)`. Values that change go in `{placeholders}` (`t('Pay {amount}', { amount })`), so each sentence is translated once, not once per value.
- Strings a screen asks for are batched into one request (up to 100 per call). Results are kept on the device (`ridetrack.language` in AsyncStorage), so each string is only translated once per language and works offline afterwards.
- English shows until the translation arrives, when there is no API key, or when the request fails (retried after a minute). When Google rejects a request (bad key, API not enabled, billing off), its error message is shown under the language picker. If Google drops a `{placeholder}`, that string stays in English rather than showing a broken sentence.
- Shared components (`Button`, `TextField`, `EmptyState`, `ErrorMessage`, `Loading`, `StatusBadge`, `Chips`, ...) translate their text props themselves, so screens pass English. Language names in the picker are never translated.
- Which language: the signed-in account's `language` wins; before login the device keeps the last language picked. Profile → Save sends it to the account.
- Translated: auth screens and all passenger screens, plus alert messages from the server. Staff and Authority screens only get the shared components translated (they have no language setting).
- Setup: in Google Cloud Console enable the **Cloud Translation API** (billing must be on for the project), create an API key, and set it as `EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY` (in `.env.local`, EAS and Vercel). `EXPO_PUBLIC_*` values are baked in when the bundle is built, so restart with `npx expo start -c` (or redeploy) after setting it. The key is built into the app, so restrict it to the Cloud Translation API and to the app's Android package / web domain. Google bills per character after the free tier.

## Folder structure

```
src/
├── app/                  Expo Router screens (a file = a route)
│   ├── (auth)/           login, register
│   ├── (passenger)/      home, tickets, alerts, profile (tabs) + route/[id], map/[id], buy/[routeId], ticket/[id]
│   ├── (staff)/          scan (index), count, shift tabs
│   └── (authority)/      dashboard (index), fleet, reports, alerts tabs
│       └── admin/        Admin tab, a stack: overview (index), users, new-account, vehicles, routes, trips, tickets
├── api/                  axios client, typed endpoint wrappers, mock API
├── components/           ui/ (shared), auth/, routes/, map/, tickets/, scan/, alerts/, ops/, admin/
├── i18n/                 useT() / <T>, Google Translate client (batching, retry)
├── hooks/                use-nearby-stops, use-live-vehicles, use-tickets, use-admin, ...
├── store/                Zustand stores: auth, favourites, tickets, shift, alert-banner, language
├── socket/               socket.io client
├── config/ theme/ types/ utils/
assets/
├── images/               app icon, adaptive icon layers, splash, favicon (PNG, used by app.json)
│   └── illustrations/    auth-hero, empty-tickets, empty-alerts, empty-routes at @1x/@2x/@3x
├── source/               SVG sources of the illustrations
└── expo.icon/            iOS icon (Icon Composer format): pin and bus layers
scripts/render-assets.js  draws the icon set and renders every SVG above to PNG
```

Rules: screens in `app/` stay thin and call hooks and components; all network calls live in `src/api/endpoints.ts` (never call axios from a screen); keep non-route code out of `src/app/`.

## Testing

Automated tests run with Jest, `jest-expo` and React Native Testing Library (`npm test`). They live next to the code in `__tests__` folders (never inside `src/app/`, where files become routes):

- `src/utils/__tests__/validation.test.ts`: login and register rules, and the admin forms (new staff account, new vehicle).
- `src/api/__tests__/admin.test.ts`: the mock admin API: creating accounts (own password, duplicate email), disabling blocks login, role filter, vehicle route rules, out-of-service vehicles drop out of trips, ticket paging.
- `src/__tests__/login.test.tsx`: the login screen (empty fields, wrong password, success).
- `src/components/scan/__tests__/ScanResultPanel.test.tsx`: VALID / INVALID result, icon and text, reset.
- `src/api/__tests__/ticket-flow.test.ts`: buy, pay, QR, scan once, cancel and history against the mock backend.
- `src/i18n/__tests__/use-t.test.ts`: English fallback, stored translations, placeholder filling and lost-placeholder fallback.
- `src/i18n/__tests__/google-translate.test.ts`: batching and de-duplicating strings into one Google Translate request, and keeping Google's error message on failure (fetch mocked).

Not automated yet: map screens, the camera scanner, payment in the browser, push notifications. Those need a device.

## Release

- Android package: `com.ridetrack.app` (change it in `app.json` before the first store upload; it cannot change afterwards).
- Build profiles are in `eas.json`: `development` (dev client APK), `preview` (APK for testers, mock API on) and `production` (AAB for the Play Store, mock API off).
- To build: `npx eas-cli@latest login`, then `npx eas-cli@latest build --platform android --profile preview`. For production, set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_SOCKET_URL` as EAS environment variables first.
- Web (Vercel): `vercel.json` tells Vercel to run `npm install`, then `npx expo export -p web`, and serve `dist/`, with a rewrite so dynamic routes such as `/ticket/123` fall back to the app instead of a 404. The Vercel project's Root Directory is currently `src`, so `src/vercel.json` does the same from there (installs and builds from the repo root, outputs to `src/dist`); delete it once Root Directory is cleared. In the Vercel project, leave Framework Preset as "Other" and add the `EXPO_PUBLIC_*` variables (from `.env.example`) under Settings → Environment Variables. They are baked in at build time, so redeploy after changing them.
- App icon and splash are RideTrack artwork. The splash is the brand blue (`#0B5FFF`), or `#0B0E14` in dark mode. To change the art, edit `assets/source/*.svg` (illustrations) or the mark in `scripts/render-assets.js` (icons), then run `npm install --no-save @resvg/resvg-js` and `node scripts/render-assets.js` from the project root. It rewrites the PNGs in `assets/images/` and the iOS layers in `assets/expo.icon/Assets/`.

## Accessibility

Body text is at least 16 pt, touch targets are at least 44 px, and status is always shown by icon and text, never colour alone (NFR8). Every text and background colour pair in the light and dark themes was checked for a contrast ratio of at least 4.5:1. The very large numerals (scan result, passenger count, dashboard tiles) cap their font scaling at 1.2 to 1.3 times so they cannot overflow. Tab labels are 14 pt, below the 16 pt body size.

## Known limitations

- Map markers jump between positions instead of animating.
- The map is native only; the web build shows a notice instead.
- Android release builds need a Google Maps API key in `app.json`.
- Checked against the real backend (RideTrack-API): login, routes, arrivals, nearby stops, buying and paying for a ticket, ticket list, `POST /scans`, publishing an alert, `GET /ops/dashboard`, reports and every `/admin/*` endpoint. Not yet checked against it: `POST /vehicles/:id/occupancy` and `PUT /users/me/push-token`.
- On the real backend, `GET /alerts` only returns alerts sent to the signed-in user, and officers are never recipients, so the authority's "Published alerts" list stays empty there. It needs a backend endpoint for all alerts.
- The admin overview needs the RideTrack-API fix that renames the `delayed` column alias in `src/modules/admin/service.js` (`DELAYED` is a reserved word in MySQL); without it `GET /admin/overview` returns a 500.
- The admin panel cannot yet create or edit routes, stops or trips, or change a staff member's vehicle after the account is made (the backend supports the last one: `PATCH /admin/users/:id` with `vehicleId`). There is no way to delete an account, only to disable it.
- In mock mode a ticket can only be scanned if it was bought in the same app session (the mock data lives in memory).
- Translation is machine translation from Google Translate, not reviewed by a Sinhala or Tamil speaker. The first time a screen opens in a new language it shows English for a moment until the translation arrives, and stays English offline until it has been translated once. Real Google translation has not yet been checked with a live API key.
- The Google Translate API key ships inside the app. Restrict it in Google Cloud Console; a backend proxy would hide it completely.
- Dates and times still use the device's locale format, not the chosen language.
- Push notifications need a development build on Android (Expo Go no longer supports remote push there); the in-app banner and Alerts tab work everywhere. The exact body of `PUT /users/me/push-token` (`{token}`, a native FCM/APNs token) is assumed.
- Report, dashboard and admin data in mock mode is fake (deterministic numbers and generated trips), and admin changes in mock mode are lost when the app reloads.
- Not yet done for Phase 8: testing on real Android devices (including a low-end one), airplane-mode checks, a screen reader pass, a usability test with commuters and staff, and the real EAS build.
- Offline route data can be up to 24 hours old; arrivals shown offline are the last ones fetched.
- Lint reports one existing warning in `src/api/client.ts` (axios import style).
- The new icons and splash have not been seen on a device yet: the splash only shows in a real build (not Expo Go), and the iOS Liquid Glass icon (`assets/expo.icon`) has not been opened in Icon Composer or built for iOS.
- Unused Expo template images (`expo-badge*`, `expo-logo`, `react-logo*`, `logo-glow`, `tutorial-web`, `tabIcons/`) are still in `assets/images/`.

## Comparison with LMT GO (Lanka Metro Transit)

Reference: the public LMT GO app description ([store listing summary](https://mwm.ai/apps/lmt-go/6761980523), [GPS tracking news](https://www.newswire.lk/9mzi)). Only the public description was used, not the app itself.

| LMT GO feature | RideTrack |
|---|---|
| Live bus map and arrival times | Done |
| Live occupancy | Done |
| QR tickets, valid offline | Done |
| Offline routes and timetables | Done (24 h cache) |
| Service alerts | Done (delays, cancellations, route changes); no "bus approaching" alert yet |
| Sinhala, Tamil, English | Language saved, text not translated yet |
| Browse stops and routes without an account | Not done: the app needs login first |
| E-wallet balance, day/week/month passes | Not done: needs new screens and backend support |
| Journey planner (transfers, walking, fare) | Not done: needs a new screen and backend support |
| Book wheelchair space | Not done: needs a new screen and backend support |

The "not done" rows all need new screens or API endpoints, so they were left out to keep the current UI unchanged.

## Keeping this README current

This README is part of the code. Whenever a change adds or alters a screen, feature, script, environment variable, dependency, folder, or known limitation, update the matching section in the same commit, especially **Project status**, **Features built so far** and **Known limitations**. This rule is also in `AGENTS.md` so coding agents follow it.
