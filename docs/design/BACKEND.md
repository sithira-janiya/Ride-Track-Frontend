# Backend Guide (for beginners)

The backend lives in a **separate repository**, `ridetrack-backend`, owned by Fernando. This repo (the mobile app) only connects to it. This page explains how the two fit together and what to do, step by step.

## Current project

Firebase project name `ridetrack`, project ID `ridetrack-5ff36` (Spark plan). Firestore holds `alerts`, `routes`, `schedules`, `users` and `vehicles`, and Authentication holds the three test users. The project ID is not a secret; the API key and app ID still go only in each member's local `.env`.

## The big picture

RideTrack uses **Firebase**, Google's ready-made backend. Firebase gives us a login system (Authentication) and a database (Firestore) that the app talks to directly, so there is no server for us to build or host. It is free on the Spark plan.

```
 ridetrack-backend repo                 Firebase project (in the cloud)             ridetrack repo (this one)
 ----------------------                 -------------------------------             -------------------------
 firestore.rules         --deploy-->    Security rules                              src/lib/firebase.ts
 firestore.indexes.json  --deploy-->    Indexes                                     reads keys from .env
 scripts/seed.mjs        --seed---->    Data + test users   <--- reads/writes ---   screens and stores
```

- The **backend repo** defines the rules and loads the data.
- The **Firebase project** is where the data actually lives.
- The **mobile repo** connects to the Firebase project with four keys in `.env`.

The two repos never import each other. They only share the Firebase project.

### Why a separate repo?
- Backend changes (rules, data) can be reviewed and deployed without touching the app.
- Secrets such as the service account key stay out of the app's code.
- Matches the task split: Fernando owns the backend, the others own the app.

## Who does what

| Person | Task |
|---|---|
| Fernando (backend owner) | Do the one-time setup in the backend repo README, then send the four keys to the team |
| Everyone else | Put the keys in their own `.env` in this repo and run the app |

## Part A: Backend owner (Fernando)

1. Create the GitHub repo `ridetrack-backend` (empty, no README). The starter files are already prepared in the folder `ridetrack-backend` next to this project. From inside that folder:
   ```bash
   git remote add origin https://github.com/<group>/ridetrack-backend.git
   git push -u origin main
   git push -u origin dev
   ```
2. Follow the **README in the backend repo**, steps 1 to 9. In short: create the Firebase project, turn on Email/Password login, create the Firestore database, register a web app, deploy the rules (`npm run deploy:rules`), and load sample data (`npm run seed`).
3. Copy the four values from the Firebase "web app" config (`apiKey`, `authDomain`, `projectId`, `appId`) and send them privately to the team.
4. Protect `main` and `dev` on the new repo the same way as this one (see [GIT-WORKFLOW.md](../process/GIT-WORKFLOW.md#branch-protection-setup)).

## Part B: Everyone, connect this app to the backend

1. In this repo, copy the template:
   ```bash
   cp .env.example .env
   ```
   (On Windows PowerShell: `Copy-Item .env.example .env`.)
2. Open `.env` and paste the values you were given:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
   EXPO_PUBLIC_FIREBASE_APP_ID=...
   ```
   `.env` is ignored by Git, so it is never uploaded. Do not share it publicly.
3. Restart with a clean cache so the app reads the new values:
   ```bash
   npx expo start -c
   ```
4. Check the first screen. At the bottom it says:
   - `Backend: connected to Firebase` means the keys are loaded.
   - `Backend: not configured (using sample data)` means `.env` is missing or empty.

Screens still show sample data until they are switched to read from Firestore (each owner does this for their own screens).

## How the app uses the connection

`src/lib/firebase.ts` is the only place that talks to Firebase setup. It exports:

| Export | Use |
|---|---|
| `isBackendConfigured` | `true` when `.env` has the keys |
| `isUsingEmulator` | `true` when pointed at the local emulator |
| `getBackend()` | Returns `{ app, auth, db }`. Throws a clear message if `.env` is missing |

Example, reading routes of the chosen transport:

```ts
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getBackend } from '@/lib/firebase';

const { db } = getBackend();
const snapshot = await getDocs(query(collection(db, 'routes'), where('type', '==', 'bus')));
const routes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
```

Rule of thumb from [ARCHITECTURE.md](ARCHITECTURE.md): screens never call Firebase directly. Put queries in `src/lib/` (for example `home-data.ts`) and call those from screens.

## Test accounts

Created by the backend seed script (password `Test@123`):

| Role | Email |
|---|---|
| Passenger | passenger@ridetrack.test |
| Conductor | conductor@ridetrack.test |
| Authority | authority@ridetrack.test |

## When something changes

| Change | Where | Then |
|---|---|---|
| New or changed collection or field | Update [DATA-MODEL.md](DATA-MODEL.md) here **and** the rules or seed in the backend repo | Tell the team |
| Security rule change | `firestore.rules` in the backend repo | `npm run deploy:rules` |
| Query asks for an index | Click the link in the error | Add it to `firestore.indexes.json` in the backend repo |
| New sample data | `scripts/seed.mjs` in the backend repo | `npm run seed` |

## Common problems

| Problem | Fix |
|---|---|
| "Backend: not configured" | `.env` missing, empty or app not restarted; run `npx expo start -c` |
| `permission-denied` | The user is not signed in, or the rules do not allow it for that role; check `firestore.rules` and the user's `role` field |
| `auth/invalid-api-key` | A key in `.env` is wrong; copy it again from Firebase project settings |
| "The query requires an index" | Open the link in the error message and create the index, then add it to the backend repo |
| App cannot reach the emulator on a phone | Use the computer's Wi-Fi IP in `EXPO_PUBLIC_EMULATOR_HOST`, not `localhost` |

## Status

The backend repo is prepared but the Firebase project, rules deployment and seed run are still to be done by the backend owner. See the backend tasks in [MEMBERS.md](../project/MEMBERS.md).
