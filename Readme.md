# RideTrack

RideTrack is a mobile app that shows where Sri Lankan buses and trains are right now, when they will arrive, and lets passengers buy QR tickets that conductors scan.

It is the **IT3060 HCI** group project (Y3.S2.WE_62) at **SLIIT**. Milestones 1 and 2 are done; **Milestone 3** (working app + testing + final report) is due **9 Oct 2026**.

## Roles

| | Passenger | Conductor / inspector | Transport authority |
|---|---|---|---|
| **Who it is for** | Daily commuters, students, tourists | Bus conductors, train ticket inspectors | NTC / Sri Lanka Railways officers |
| **Main jobs in the app** | Search routes, track a vehicle live, buy and keep a QR ticket | Scan and validate tickets, count passengers, report delays | Watch the live network, manage vehicles, routes and fares, publish alerts |

## Team

| Member | Student ID | Owns |
|---|---|---|
| Silva D S J (leader) | IT23652200 | Passenger search & live tracking |
| Rajapaksha M.P.K | IT23665620 | Booking, tickets & profile |
| Herath H.M.S.G | IT23634626 | Conductor / inspector |
| Fernando H L R D | IT23635302 | Transport authority + shared database |

## Features and screens

42 screens across 4 work areas. Each screen needs at least 2 working CRUD operations.

| Area | Owner | Screens | Requirements |
|---|---|---|---|
| Search & tracking | Silva | Home, Select Transport, Search, Results, Filter & Sort, Transport Details, Route & Stops, Live Tracking (8) | FR3, FR4, FR7 |
| Booking & tickets | Rajapaksha | Confirm Journey, Passenger Details, Payment, Booking Confirmation, Digital Ticket, My Tickets, Ticket Details, Cancel Booking, Journey History, Notifications, Profile (11) | FR1, FR2, FR5, FR8, FR11, FR12 |
| Conductor | Herath | Staff Login, Dashboard, Assigned Journey, Scan Ticket, Valid, Invalid, Passenger List, Report Incident, Incident Reported, Journey Completion (10) | FR2, FR6, FR7, FR8 |
| Authority | Fernando | Dashboard, Vehicle Mgmt, Add Vehicle, Routes, Stops, Schedule, Fare & Facilities, Preview & Publish, Live Operations, Incident Mgmt, Review Incident, Create Alert, Alert Published (13) | FR8, FR9, FR10 |

The parts connect at three points:

1. A passenger's QR ticket is scanned by the conductor.
2. A conductor's incident reaches the authority.
3. An authority alert lands in passengers' Notifications.

## Tech stack (all free)

| Layer | Choice | Why |
|---|---|---|
| App | **React Native + Expo (SDK 52+) + TypeScript** | Required; Expo Go means no Android Studio needed |
| Navigation | **Expo Router** (file-based) | One file = one screen, easy to split between members and for Claude Code to generate |
| Backend / DB | **Firebase Firestore** (Spark free plan) | Real-time listeners give live tracking and alerts with no server |
| Auth | **Firebase Authentication** (email + password) | Three roles via a `role` field on the user document |
| Maps | **react-native-maps** | Works inside Expo Go |
| QR generate | **react-native-qrcode-svg** | Digital ticket |
| QR scan | **expo-camera** (`CameraView` barcode scanning) | Conductor scan screen |
| State / forms | **Zustand** + **React Hook Form** + **Zod** | Small, simple, validated forms |
| UI kit | **React Native Paper** | Free Material components, quick to look consistent |
| Build | **EAS Build** (free tier) | Produces the submission APK |

Payments are **simulated** (no real gateway) so everything stays free.

## Getting started

You need: Node.js 20+, Git, the **Expo Go** app on an Android phone (or an Android emulator), and access to the group's Firebase project.

1. Clone the repo and install packages:

   ```bash
   git clone https://github.com/<group>/ridetrack.git
   cd ridetrack
   npm install
   ```

2. Create a `.env` file in the project root with the Firebase keys (get them from Fernando; **never commit this file**):

   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
   EXPO_PUBLIC_FIREBASE_APP_ID=...
   EXPO_PUBLIC_MAPS_API_KEY=...
   ```

3. Start the app and scan the QR code with Expo Go:

   ```bash
   npx expo start
   ```

4. Load the sample data (routes, vehicles, test users) once:

   ```bash
   npm run seed
   ```

5. Build the installable APK for submission:

   ```bash
   npm install -g eas-cli
   eas build -p android --profile preview
   ```

### Test logins (created by the seed script)

| Role | Email | Password |
|---|---|---|
| Passenger | passenger@ridetrack.test | Test@123 |
| Conductor | conductor@ridetrack.test | Test@123 |
| Authority | authority@ridetrack.test | Test@123 |

## Project structure

```
ridetrack/
├── app/                    # Expo Router screens
│   ├── (passenger)/        # Search & tracking, booking & tickets
│   ├── (conductor)/        # Staff login, scan, incidents
│   └── (authority)/        # Vehicles, routes, alerts, live ops
├── components/             # Shared UI pieces
├── lib/                    # firebase.ts, auth, Firestore helpers
├── store/                  # Zustand stores
├── scripts/seed.ts         # Sample data loader
├── .env                    # Firebase keys (git-ignored)
└── app.json / eas.json
```

## Data model (Firestore collections)

| Collection | Key fields |
|---|---|
| `users` | name, email, role (`passenger` / `conductor` / `authority`) |
| `vehicles` | type (bus/train), number, capacity, status, location (lat/lng) |
| `routes` | name, stops[], fare, facilities |
| `schedules` | routeId, vehicleId, departure, arrival |
| `bookings` | userId, scheduleId, passengers[], status, qrCode |
| `incidents` | conductorId, vehicleId, type, description, status |
| `alerts` | title, message, createdBy, createdAt (shown in passenger Notifications) |

## Git rules

- Work on your own branch: `feature/<area>-<screen>` (for example `feature/booking-payment`).
- Open a pull request into `main`; at least one teammate reviews it.
- Never commit `.env` or keys.
- Pull `main` before starting each work session.

## Links

| Resource | Link |
|---|---|
| Figma: hi-fi prototype | RideTrack hi-fi |
| Figma: low-fi prototype | RideTrack low-fi |
| M2 user-testing recordings | Google Drive folder |
| GitHub repo | _Add link here_ |
| APK build | _Add link here_ |
