# RideTrack

RideTrack shows where Sri Lankan buses and trains are right now and when they will arrive, and sells QR tickets that conductors scan. This repository holds the whole system:

| Folder | What it is | Stack | Was |
|---|---|---|---|
| [`app/`](app/README.md) | The app for passengers, staff (conductors, inspectors) and transport officers, on Android, iPhone (web) and any browser | Expo SDK 57, React Native, TypeScript | `Ride-Track-Frontend` repo |
| [`backend/`](backend/README.md) | REST + Socket.IO API, web admin panel, and the app's QR download page | Node 20+, Express, MySQL | `RideTrack-API` repo (`Ride-Track-Backend` on GitHub) |
| [`firebase-app/`](firebase-app/Readme.md) | The first version of the app on Firebase, with the HCI project documents (screens, requirements, testing) | Expo SDK 57, Firebase | `RideTrack` repo |

Each folder keeps its full Git history, so `git log -- backend/` shows the backend's past commits. The folders do not share code or dependencies: install and run each one on its own.

## Quick start

```bash
# 1. The app with its built-in mock API (no backend needed)
cd app
npm install
npx expo start          # scan the QR code with Expo Go, or press w for the web version
```

The first screen explains how RideTrack works; in mock mode it also lists demo accounts (password `Password1!`).

```bash
# 2. The real backend (needs MySQL; see backend/README.md)
cd backend
npm install
cp .env.example .env    # then edit
npm run migrate && npm run seed && npm run dev
```

Then point the app at it in `app/.env.local` (`EXPO_PUBLIC_USE_MOCK_API=false`, `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SOCKET_URL`), as described in [app/README.md](app/README.md#running-against-the-real-backend-backend).

## Getting the app on a phone (QR code)

The backend serves one QR code at `/download` (print it or show it on screen). Scanning it opens `/download/start`, a page of instructions first:

- **Android**: download the APK, allow "install unknown apps", install and open.
- **Any phone, iPhone included**: open the web version and add it to the home screen.
- What passengers, conductors and officers do once they are in the app.

The option that suits the phone that scanned is shown first. Inside the app, the first launch also shows **How RideTrack works** before the login screen.

## Web version on every phone

`npm run build:web` (in `app/`) builds the web version so it runs on current phones and older ones too: iPhone Safari from iOS 12, Chrome from version 69 and Samsung Internet from version 10. It lowers newer JavaScript in the build, adds small polyfills, uses a notch-safe viewport, and shows real maps (Leaflet + OpenStreetMap) instead of the native-only map. Details: [app/README.md](app/README.md#features-built-so-far).

## Deployment

| Part | Where | Settings after this merge |
|---|---|---|
| Web app | Vercel project `ride-track-frontend-src` (deploys this repo) | Root Directory is still `src`; `src/vercel.json` builds `app/` from there, so deploys keep working. Better: set Root Directory to `app` and delete the top-level `src/` folder. |
| Backend | Railway (deploys the `Ride-Track-Backend` repo) | To deploy from this repo instead, set the Railway service's Root Directory to `backend`. |
| Android APK | EAS Build | Run `npx eas-cli@latest build -p android --profile preview` in `app/`. Put the APK where the backend serves it (`APK_PATH` or `APK_URL`). |

## Checks

| Folder | Commands |
|---|---|
| `app/` | `npx tsc --noEmit`, `npx expo lint`, `npm test`, `npx expo-doctor`, `npm run build:web` |
| `backend/` | `npm test` (needs a MySQL test database, see `backend/README.md`) |
| `firebase-app/` | `npm run typecheck`, `npm run lint`, `npm test`, `npx expo-doctor` |

Never commit `.env` files: every part has a `.env.example` to copy.
