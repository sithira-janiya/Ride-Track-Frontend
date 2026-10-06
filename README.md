# RideTrack Frontend

Mobile app for RideTrack, a public transport (bus and train) tracking and ticketing system. One React Native app serves three kinds of user; the screens shown depend on the logged-in user's role: **Passenger**, **Staff** (conductor/inspector) and **Authority**.

> This file is kept up to date as the app is built. See [Keeping this README current](#keeping-this-readme-current).

## Tech stack

| Concern | Choice |
|---|---|
| Framework | React Native + Expo SDK 57 (managed workflow), TypeScript |
| Navigation | Expo Router (file-based, routes in `src/app/`) |
| Server state | TanStack Query |
| Client state | Zustand (auth, favourites, ticket cache) |
| HTTP / real-time | Axios, socket.io-client |
| Maps | react-native-maps (native only; web shows a notice) |
| Tickets / scanning | react-native-qrcode-svg, expo-brightness, expo-web-browser, expo-camera, expo-haptics |
| Storage | expo-secure-store (tokens), AsyncStorage (favourites, ticket cache) |
| Forms | React Hook Form |

## Getting started

```bash
npm install
cp .env.example .env.local   # then edit if needed
npx expo start               # scan the QR code with Expo Go, or press w for web
```

By default the app runs against a **built-in mock API** (`EXPO_PUBLIC_USE_MOCK_API=true`), so no backend is needed. Set it to `false` and point `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_SOCKET_URL` at the real backend to use live data.

### Demo accounts (mock mode only)

All use the password `Password1!`.

| Role | Email |
|---|---|
| Passenger | `passenger@ridetrack.test` |
| Staff | `staff@ridetrack.test` |
| Authority | `officer@ridetrack.test` |

### Useful commands

```bash
npx tsc --noEmit    # typecheck
npx expo lint       # lint
npx expo-doctor     # check dependencies and config
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
| 6 | Passenger: alerts and profile settings | Not started |
| 7 | Authority: dashboard, live fleet, reports, alerts | Not started |

## Features built so far

**Passenger**
- Search routes (debounced, bus/train filter), nearby stops (asks for location), favourite routes.
- Route detail: ordered stops with fares, upcoming arrivals at a chosen stop.
- Live map: route line, stops and moving vehicles over WebSocket, with arrival time and occupancy (icon and text). Shows "Live / Reconnecting" and an "out of date" warning after 60 s without updates.
- Tickets: pick boarding stop, drop-off stop and trip, see the fare, pay. A pending payment is saved on the device and re-checked when the app resumes, so it is never lost. Ticket list with filters and paging, QR screen with a screen-brightness boost, cancel an unused ticket. Tickets are cached on the device so they still show offline, and cleared on logout.

**Staff**
- Scan tab: camera permission flow, QR scanning, then a large VALID / INVALID result with the reason (icon, word and colour) and haptic feedback. "Scan next ticket" resets for the next passenger. If a QR will not scan, type the ticket number instead.
- Passengers tab: set the on-board passenger count for the shift's vehicle (+/- 1 and 5), sent to the server with Save.
- Shift tab: choose route and trip (and so the vehicle) for the shift; remembered on the device.

**Auth**: email or phone login, register, session restored on app start, role decides which screens appear.

## Folder structure

```
src/
├── app/                  Expo Router screens (a file = a route)
│   ├── (auth)/           login, register
│   ├── (passenger)/      home, tickets, profile (tabs) + route/[id], map/[id], buy/[routeId], ticket/[id]
│   ├── (staff)/          scan (index), count, shift tabs
│   └── (authority)/      authority home (dashboard arrives in Phase 7)
├── api/                  axios client, typed endpoint wrappers, mock API
├── components/           ui/ (shared), auth/, routes/, map/, tickets/, scan/
├── hooks/                use-nearby-stops, use-live-vehicles, use-tickets, ...
├── store/                Zustand stores: auth, favourites, tickets, shift
├── socket/               socket.io client
├── config/ theme/ types/ utils/
```

Rules: screens in `app/` stay thin and call hooks and components; all network calls live in `src/api/endpoints.ts` (never call axios from a screen); keep non-route code out of `src/app/`.

## Accessibility

Body text is at least 16 pt, touch targets are at least 44 px, and status is always shown by icon and text, never colour alone (NFR8).

## Known limitations

- Map markers jump between positions instead of animating.
- The map is native only; the web build shows a notice instead.
- Android release builds need a Google Maps API key in `app.json`.
- The real backend does not exist yet; the shapes of `POST /tickets` and the `GET /tickets` paging are assumed (see `src/api/endpoints.ts`).
- The real backend's response to `POST /scans` and `POST /vehicles/:id/occupancy` is assumed (`{result, reason}` and `{vehicleId, passengerCount, capacity}`).
- In mock mode a ticket can only be scanned if it was bought in the same app session (the mock data lives in memory).
- Lint reports one existing warning in `src/api/client.ts` (axios import style).

## Keeping this README current

This README is part of the code. Whenever a change adds or alters a screen, feature, script, environment variable, dependency, folder, or known limitation, update the matching section in the same commit, especially **Project status**, **Features built so far** and **Known limitations**. This rule is also in `AGENTS.md` so coding agents follow it.
