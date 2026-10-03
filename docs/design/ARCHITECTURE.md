# Architecture

## Overview

RideTrack is a single React Native (Expo) app with three role-based areas, backed by Firebase. There is no custom server: the app talks to Firestore and Firebase Auth directly, and real-time listeners push changes to every device.

```
┌──────────────────────── Expo app (React Native) ────────────────────────┐
│  (passenger)            (conductor)             (authority)             │
│  search, track,         login, scan,            vehicles, routes,       │
│  book, tickets          passengers, incidents   live ops, alerts        │
│            \                  |                  /                      │
│             └──── lib/ (auth, Firestore helpers) ┘   store/ (Zustand)   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ Firebase SDK (HTTPS + websockets)
                ┌───────────────┴────────────────┐
                │ Firebase Auth  │   Firestore   │
                │ (email/pass)   │ (+ rules)     │
                └────────────────────────────────┘
```

## Folder structure

```
src/
├── app/            Routes only. A file here is a screen; keep logic thin.
├── components/     Reusable UI shared by more than one screen
│   ├── ui/           Generic building blocks (Screen, PlaceholderScreen)
│   ├── navigation/   Navigation pieces (RoleTabs)
│   ├── transport/    Bus/train components (TransportBadge)
│   ├── home/         Cards used on the passenger Home screen
│   ├── search/       Search form pieces (PlaceInput, RecentSearchItem)
│   └── results/      Results list card (ResultCard)
├── constants/      Theme tokens and fixed values (theme.ts, transport.ts, results.ts)
├── hooks/          Reusable hooks (use-start-search.ts)
├── data/           Static sample data used until Firebase is connected (sample-data.ts)
├── lib/            Data access and services: home-data.ts and search-data.ts read data/, later Firestore
├── store/          Zustand stores (current user, transport choice, saved routes, recent searches, results filter, booking draft)
└── types/          Shared TypeScript types (models.ts: Vehicle, Route, Alert)
```

Rules:

| Rule | Why |
|---|---|
| Screens live only in `src/app/`; one file per screen | Expo Router builds navigation from files |
| Shared UI goes in `src/components/<group>/`; a component used by one screen stays next to it | Keeps `components/` small and truly shared |
| Colours, spacing and fixed lists come from `src/constants/` | One place to change the look |
| Screens never call Firebase directly; use functions in `src/lib/` | Easy to test and change the backend |
| Sample or mock data lives in `src/data/`, never inside screens or `lib/` | Removing it later is one folder |
| Shared TypeScript shapes live in `src/types/models.ts` | One definition per entity, matches DATA-MODEL.md |
| App state in `src/store/` | One source of truth |
| Import with `@/` (maps to `src/`) | No long relative paths |
| Docs sit in `docs/project`, `docs/design` or `docs/process` | Easy to find |

## Layers

| Layer | Responsibility | Location |
|---|---|---|
| Screens | UI and navigation, one file per screen | `src/app/` |
| Components | Reusable UI (cards, buttons, map markers) | `src/components/` |
| State | Current user, role, booking draft, transport choice | `src/store/` |
| Data access | Firebase init, typed queries and writes (sample data until Firebase is connected) | `src/lib/` |
| Backend | Auth, database, security rules. Defined in the separate `ridetrack-backend` repo and deployed to Firebase ([BACKEND.md](BACKEND.md)) | Firebase |

## Role routing

After sign-in the app reads `users/{uid}.role` and redirects to the matching route group. Expo Router layouts guard each group so a passenger cannot open conductor or authority screens.

| Role | Route group |
|---|---|
| passenger | `src/app/(passenger)/` |
| conductor | `src/app/(conductor)/` |
| authority | `src/app/(authority)/` |

## Passenger transport choice (bus or train)

A passenger's first step is choosing **bus** or **train** on the Select Transport screen. The choice drives the rest of the passenger app.

- Stored in `src/store/transport-store.ts` (Zustand, saved to device storage so it survives restarts). Values: `bus`, `train`, or `null` before the first choice.
- `src/app/(passenger)/(tabs)/_layout.tsx` waits for the saved value to load, then redirects to `select-transport` if it is `null`.
- Home shows the current choice with a **Change transport** button that reopens Select Transport.
- Data screens must filter by it: every Firestore query on `routes`, `vehicles` and `schedules` adds `where('type', '==', transport)`.
- Conductor and authority areas are not affected; the authority manages both types.

```
First launch ──▶ Select Transport ──▶ transport = bus | train ──▶ Home / Search / Tracking (filtered)
                        ▲                                                    │
                        └───────────── Change transport (Home) ──────────────┘
```

## The three connection points

1. **Ticket scan.** The passenger's Digital Ticket shows a QR encoding the booking id. The conductor's Scan Ticket reads it, loads `bookings/{id}`, and routes to Valid or Invalid, then marks the ticket used.
2. **Incident report.** The conductor's Report Incident writes to `incidents`. The authority's Incident Mgmt listens to that collection and shows new items live.
3. **Alert.** The authority's Create Alert writes to `alerts`. Passenger Notifications listens to `alerts` and updates live.

```
Passenger ──booking QR──▶ Conductor
Conductor ──incident────▶ Authority
Authority ──alert───────▶ Passenger
```

## Live tracking

Vehicles write `location` (lat/lng, updated time) to `vehicles/{id}`. For the demo the seed script and a small simulator update positions along a route. The Live Tracking screen subscribes with `onSnapshot` and moves the marker on the map. Authority Live Operations uses the same listener across all vehicles.

## Key decisions

| Decision | Reason |
|---|---|
| Firebase over a custom API | Free tier, real-time built in, no server to host |
| One app, three role areas | One APK to submit and demo |
| Simulated payment | Avoids paid gateways; flow and UI are still tested |
| Expo Router | File-based screens map one-to-one to the 42-screen list |
| Client-side role guard plus Firestore rules | UI hiding is not security; rules enforce access |
