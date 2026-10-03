# RideTrack

RideTrack is a React Native mobile app that shows where Sri Lankan buses and trains are right now, when they will arrive, and lets passengers buy QR tickets that conductors scan.

Built by Group Y3.S2.WE_62 for IT3060 Human Computer Interaction, SLIIT.

## Features

| Role | Who | What they can do |
|---|---|---|
| **Passenger** | Daily commuters, students, tourists | **Choose bus or train first** (the whole app then shows only that type), search routes, filter and sort results, track a vehicle live on a map, book and pay for a ticket, keep a QR ticket, cancel bookings, view journey history, receive alerts, manage profile |
| **Conductor / inspector** | Bus conductors, train ticket inspectors | Sign in as staff, view assigned journey, scan and validate QR tickets, see passenger list and counts, report incidents and delays, complete a journey |
| **Transport authority** | NTC / Sri Lanka Railways officers | Manage vehicles, routes, stops, schedules, fares and facilities, publish changes, watch live operations, review incidents, publish alerts |

The three parts connect at three points:

1. A passenger's QR ticket is scanned by the conductor.
2. A conductor's incident reaches the authority.
3. An authority alert lands in passengers' Notifications.

Passengers pick **bus or train** on first launch; search, results, details and live tracking then show that type only, and the choice can be changed from Home.

The app has 42 screens in 4 work areas, and each screen supports at least 2 CRUD operations. See [docs/SCREENS.md](docs/project/SCREENS.md).

## Team and ownership

| Member | Student ID | Area | Screens | Requirements |
|---|---|---|---|---|
| Silva D S J (leader) | IT23652200 | Passenger search & live tracking | 8 | FR3, FR4, FR7 |
| Rajapaksha M.P.K | IT23665620 | Booking, tickets & profile | 11 | FR1, FR2, FR5, FR8, FR11, FR12 |
| Herath H.M.S.G | IT23634626 | Conductor / inspector | 10 | FR2, FR6, FR7, FR8 |
| Fernando H L R D | IT23635302 | Transport authority + shared database | 13 | FR8, FR9, FR10 |

Member-wise features and tasks are in [docs/MEMBERS.md](docs/project/MEMBERS.md).

## Tech stack

All free.

| Layer | Choice |
|---|---|
| App | React Native + Expo + TypeScript |
| Navigation | Expo Router |
| Backend / database | Firebase Firestore (Spark free plan) |
| Authentication | Firebase Authentication (email and password, role-based) |
| Maps | react-native-maps |
| QR generate / scan | react-native-qrcode-svg / expo-camera |
| UI, state, forms | React Native Paper, Zustand, React Hook Form + Zod |
| Build | EAS Build (Android APK) |

Payments are simulated. Details and reasoning: [docs/TECH-INFO.md](docs/design/TECH-INFO.md).

## Getting started

You need: Node.js 20+, Git, the **Expo Go** app on an Android phone (or an Android emulator), and the Firebase keys from the backend owner (Fernando). The backend lives in a separate repository, `ridetrack-backend`; see [docs/design/BACKEND.md](docs/design/BACKEND.md).

1. Clone the repository and install packages:

   ```bash
   git clone https://github.com/<group>/ridetrack.git
   cd ridetrack
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the Firebase keys (ask Fernando; **never commit `.env`**):

   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
   EXPO_PUBLIC_FIREBASE_APP_ID=...
   EXPO_PUBLIC_MAPS_API_KEY=...
   ```

3. Start the app and scan the QR code with Expo Go. The first screen shows `Backend: connected to Firebase` when the keys are loaded:

   ```bash
   npx expo start -c
   ```

4. Sample data (routes, vehicles, test users) is loaded once by the backend owner from the `ridetrack-backend` repository (`npm run seed` there). You do not run it in this repo.

5. Build the installable APK:

   ```bash
   npm install -g eas-cli
   eas build -p android --profile preview
   ```

### Test logins (created by the backend seed script)

| Role | Email | Password |
|---|---|---|
| Passenger | passenger@ridetrack.test | Test@123 |
| Conductor | conductor@ridetrack.test | Test@123 |
| Authority | authority@ridetrack.test | Test@123 |

## Repository structure

```
ridetrack/
├── src/                      Application code
│   ├── app/                  Routes only (Expo Router), one file per screen
│   │   ├── (passenger)/      select-transport + (tabs)
│   │   ├── (conductor)/
│   │   └── (authority)/
│   ├── components/           Reusable UI, grouped by purpose
│   │   ├── ui/               Screen, PlaceholderScreen, SectionHeader
│   │   ├── navigation/       RoleTabs
│   │   ├── transport/        TransportBadge
│   │   ├── home/             Cards for the passenger Home screen
│   │   ├── search/           Search form pieces
│   │   └── results/          Results list card
│   ├── constants/            Theme tokens, transport types
│   ├── data/                 Sample data used until Firebase is connected
│   ├── lib/                  Data access and services (Firebase later)
│   ├── store/                Zustand stores
│   └── types/                Shared TypeScript types (models.ts)
├── assets/                   Icons and images
├── scripts/                  Helper scripts (the data seed lives in the backend repo)
├── docs/                     Documentation (see below)
│   ├── project/              Tasks, members, screens, traceability
│   ├── design/               Architecture, data model, UI guide, tech info
│   └── process/              Git workflow, testing, usability testing
├── app.json                  Expo config
├── .env.example              Environment template (copy to .env)
└── Readme.md
```

Full rules for where code belongs: [docs/design/ARCHITECTURE.md](docs/design/ARCHITECTURE.md#folder-structure).

## Documentation

Index: [docs/README.md](docs/README.md)

| Folder | Document | Contents |
|---|---|---|
| project | [TASKS](docs/project/TASKS.md) | Project task list, status and update log |
| project | [MEMBERS](docs/project/MEMBERS.md) | Features and tasks per team member |
| project | [SCREENS](docs/project/SCREENS.md) | All 42 screens and CRUD operations |
| project | [TRACEABILITY](docs/project/TRACEABILITY.md) | Requirements to screens to tests |
| design | [ARCHITECTURE](docs/design/ARCHITECTURE.md) | App architecture, folder structure, role flows |
| design | [DATA-MODEL](docs/design/DATA-MODEL.md) | Firestore collections and rules |
| design | [UI-GUIDE](docs/design/UI-GUIDE.md) | Theme, shared components, navigation shell |
| design | [BACKEND](docs/design/BACKEND.md) | Backend repo, Firebase setup, how to connect |
| design | [TECH-INFO](docs/design/TECH-INFO.md) | Stack, tooling, environment |
| process | [GIT-WORKFLOW](docs/process/GIT-WORKFLOW.md) | Branching and contribution rules |
| process | [TESTING](docs/process/TESTING.md) | Test cases and defect log |
| process | [USABILITY-TESTING](docs/process/USABILITY-TESTING.md) | Usability test plan and results |

## Contributing

- `main` holds stable releases; `dev` is the integration branch.
- Work on `feature/<member>/<task>` (for example `feature/silva/search-results`), branched from `dev`.
- Open pull requests into `dev` and get one teammate's review. Compare your branch with `dev` first.
- `main` accepts pull requests from `dev` only (enforced by `.github/workflows/branch-rules.yml`). Only the team leader merges `dev` into `main`, after comparing `main` with `dev`.
- Never commit secrets.

Full rules: [docs/GIT-WORKFLOW.md](docs/process/GIT-WORKFLOW.md).

## Links

| Resource | Link |
|---|---|
| Figma: hi-fi prototype | RideTrack hi-fi |
| Figma: low-fi prototype | RideTrack low-fi |
| User-testing recordings | Google Drive folder |
| APK build | _Add link here_ |
