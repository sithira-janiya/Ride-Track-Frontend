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

## Layers

| Layer | Responsibility | Location |
|---|---|---|
| Screens | UI and navigation, one file per screen | `app/` |
| Components | Reusable UI (cards, buttons, map markers) | `components/` |
| State | Current user, role, booking draft | `store/` |
| Data access | Firebase init, typed queries and writes | `lib/` |
| Backend | Auth, database, security rules | Firebase |

## Role routing

After sign-in the app reads `users/{uid}.role` and redirects to the matching route group. Expo Router layouts guard each group so a passenger cannot open conductor or authority screens.

| Role | Route group |
|---|---|
| passenger | `app/(passenger)/` |
| conductor | `app/(conductor)/` |
| authority | `app/(authority)/` |

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
