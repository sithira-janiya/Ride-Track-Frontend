# RideTrack

RideTrack is a React Native mobile app that shows where Sri Lankan buses and trains are right now, when they will arrive, and lets passengers buy QR tickets that conductors scan.

Built by Group Y3.S2.WE_62 for IT3060 Human Computer Interaction, SLIIT.

## Features

| Role | Who | What they can do |
|---|---|---|
| **Passenger** | Daily commuters, students, tourists | Search routes, filter and sort results, track a vehicle live on a map, book and pay for a ticket, keep a QR ticket, cancel bookings, view journey history, receive alerts, manage profile |
| **Conductor / inspector** | Bus conductors, train ticket inspectors | Sign in as staff, view assigned journey, scan and validate QR tickets, see passenger list and counts, report incidents and delays, complete a journey |
| **Transport authority** | NTC / Sri Lanka Railways officers | Manage vehicles, routes, stops, schedules, fares and facilities, publish changes, watch live operations, review incidents, publish alerts |

The three parts connect at three points:

1. A passenger's QR ticket is scanned by the conductor.
2. A conductor's incident reaches the authority.
3. An authority alert lands in passengers' Notifications.

The app has 42 screens in 4 work areas, and each screen supports at least 2 CRUD operations. See [docs/SCREENS.md](docs/SCREENS.md).

## Team and ownership

| Member | Student ID | Area | Screens | Requirements |
|---|---|---|---|---|
| Silva D S J (leader) | IT23652200 | Passenger search & live tracking | 8 | FR3, FR4, FR7 |
| Rajapaksha M.P.K | IT23665620 | Booking, tickets & profile | 11 | FR1, FR2, FR5, FR8, FR11, FR12 |
| Herath H.M.S.G | IT23634626 | Conductor / inspector | 10 | FR2, FR6, FR7, FR8 |
| Fernando H L R D | IT23635302 | Transport authority + shared database | 13 | FR8, FR9, FR10 |

Member-wise features and tasks are in [docs/MEMBERS.md](docs/MEMBERS.md).

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

Payments are simulated. Details and reasoning: [docs/TECH-INFO.md](docs/TECH-INFO.md).

## Getting started

You need: Node.js 20+, Git, the **Expo Go** app on an Android phone (or an Android emulator), and access to the group's Firebase project.

1. Clone the repository and install packages:

   ```bash
   git clone https://github.com/<group>/ridetrack.git
   cd ridetrack
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the Firebase keys (ask Fernando; **never commit `.env`**):

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

5. Build the installable APK:

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

## Repository structure

```
ridetrack/
├── src/
│   ├── app/             # Expo Router screens
│   │   ├── (passenger)/
│   │   ├── (conductor)/
│   │   └── (authority)/
│   ├── components/      # Shared UI (Screen, RoleTabs)
│   ├── constants/       # Theme tokens
│   ├── lib/             # Firebase and data helpers
│   └── store/           # Zustand stores
├── assets/              # Icons and images
├── scripts/             # Seed script (seed.ts)
├── docs/                # Project documentation
├── app.json             # Expo config
├── .env.example
└── Readme.md
```

## Documentation

| Document | Contents |
|---|---|
| [docs/UI-GUIDE.md](docs/UI-GUIDE.md) | Shared theme, components, navigation shell |
| [docs/MEMBERS.md](docs/MEMBERS.md) | Features and tasks per team member |
| [docs/TASKS.md](docs/TASKS.md) | Project task list and status |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | App architecture and role flows |
| [docs/TECH-INFO.md](docs/TECH-INFO.md) | Stack, tooling, environment |
| [docs/DATA-MODEL.md](docs/DATA-MODEL.md) | Firestore collections and rules |
| [docs/SCREENS.md](docs/SCREENS.md) | All 42 screens and CRUD operations |
| [docs/TESTING.md](docs/TESTING.md) | Test cases and defect log |
| [docs/USABILITY-TESTING.md](docs/USABILITY-TESTING.md) | Usability test plan and results |
| [docs/TRACEABILITY.md](docs/TRACEABILITY.md) | Requirements to screens to tests |
| [docs/GIT-WORKFLOW.md](docs/GIT-WORKFLOW.md) | Branching and contribution rules |

## Contributing

- `main` holds stable releases; `dev` is the integration branch.
- Work on `feature/<member>/<task>` (for example `feature/silva/search-results`), branched from `dev`.
- Open pull requests into `dev` and get one teammate's review. Only the team leader merges `dev` into `main`.
- Never commit secrets.

Full rules: [docs/GIT-WORKFLOW.md](docs/GIT-WORKFLOW.md).

## Links

| Resource | Link |
|---|---|
| Figma: hi-fi prototype | RideTrack hi-fi |
| Figma: low-fi prototype | RideTrack low-fi |
| User-testing recordings | Google Drive folder |
| APK build | _Add link here_ |
