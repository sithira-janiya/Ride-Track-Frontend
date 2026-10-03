# Tech Info

All tools below are free to use for this project.

## Stack

| Area | Tool | Notes |
|---|---|---|
| Framework | React Native + Expo (SDK 52 or newer) | Cross-platform mobile, one codebase |
| Language | TypeScript | Catches field-name mistakes across team members |
| Navigation | Expo Router | File-based routing and route groups |
| UI | React Native Paper | Material components, theming |
| State | Zustand | Small global store |
| Forms | React Hook Form + Zod | Validation for Passenger Details, Add Vehicle, etc. |
| Backend | Firebase (Spark plan) | Firestore + Auth, no card needed |
| Maps | react-native-maps | Live Tracking, Route & Stops |
| QR generate | react-native-qrcode-svg | Digital Ticket |
| QR scan | expo-camera | Scan Ticket (barcode scanning) |
| Build | EAS Build free tier | Android APK |

## Why this stack

| Choice | Justified against the project's needs | Alternative considered |
|---|---|---|
| React Native + Expo | Required to be cross-platform mobile; one codebase for 42 screens; Expo Go lets all four members test on a phone without native tooling; free EAS APK build | Flutter (new language for the team) |
| TypeScript | Four people share data shapes (bookings, incidents); types catch mismatches early | Plain JavaScript |
| Firebase Firestore | Live tracking and instant alerts need real-time updates; no server to host or fund | REST API + SQL (needs hosting and more time) |
| Firebase Auth | Ready-made secure login for three roles; avoids storing passwords ourselves | Custom auth |
| react-native-maps | Standard map component, works in Expo Go | Mapbox (needs account setup) |
| expo-camera + react-native-qrcode-svg | Direct support for the QR ticket and scan flow | Third-party scanner libraries |
| React Native Paper | Consistent, accessible components; speeds up matching the hi-fi design | Building every component by hand |
| Simulated payments | Real gateways are paid and need approval; flow is still testable | Live gateway |

Constraints: free tools only, 4 members, a short timeline, Android as the target platform.

## Requirements

- Node.js 20+
- Git
- Expo Go on an Android phone, or an Android emulator
- The Firebase keys from the backend owner (backend is a separate repo, see [BACKEND.md](BACKEND.md))

## Environment variables

Stored in `.env` (git-ignored). A template `.env.example` with empty values should be committed.

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase web API key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase app id |
| `EXPO_PUBLIC_MAPS_API_KEY` | Maps key (needed for the built APK; Expo Go works without one). For the APK, `app.json` must also list the `react-native-maps` plugin with `androidGoogleMapsApiKey`; since `app.json` cannot read `.env`, convert it to `app.config.js` when building the APK. |

Variables prefixed `EXPO_PUBLIC_` are bundled into the app, so they are identifiers, not secrets. Real protection comes from Firestore security rules.

## Scripts

| Command | Does |
|---|---|
| `npm install` | Install packages |
| `npx expo start` | Start dev server, scan QR with Expo Go |
| `eas build -p android --profile preview` | Build the installable APK |

## Using Claude Code with this repo

- Keep the docs in `docs/` up to date; Claude Code reads them for context.
- Ask for one screen at a time, naming its file under `app/` and the collections it uses (see [DATA-MODEL.md](DATA-MODEL.md)).
- Run `npx expo start` and test on a device after each generated screen.
- Review every change before committing, and never paste real keys into a prompt.

## Firebase free-tier notes

- Spark plan limits are enough for a university demo.
- Cloud Functions need the paid plan, so this project avoids them; all logic runs in the app.
- Set Firestore rules before demo day, test mode expires after 30 days.

## Test accounts

See the Readme: `passenger@`, `conductor@` and `authority@ridetrack.test`, created by the backend repo's seed script.
