# RideTrack Master To-Do

One checklist built from every doc in `docs/`: [TASKS](TASKS.md), [MEMBERS](MEMBERS.md), [SCREENS](SCREENS.md), [TRACEABILITY](TRACEABILITY.md), [ARCHITECTURE](../design/ARCHITECTURE.md), [BACKEND](../design/BACKEND.md), [DATA-MODEL](../design/DATA-MODEL.md), [TECH-INFO](../design/TECH-INFO.md), [UI-GUIDE](../design/UI-GUIDE.md), [GIT-WORKFLOW](../process/GIT-WORKFLOW.md), [TESTING](../process/TESTING.md), [USABILITY-TESTING](../process/USABILITY-TESTING.md).

Legend: `[x]` Done, `[ ]` To do. Owners: **S** Silva, **R** Rajapaksha, **H** Herath, **F** Fernando, **All** everyone. Items are ordered by what unblocks what: do the sections top to bottom.

Status as of 3 Oct 2026: design done; app shell, Select Transport and Home (sample data) done; backend repo and Firebase project created and seeded; rules deployment, keys sharing and everything else open.

---

## 1. Unblock the team first (critical path)

Everything in sections 3 to 6 depends on these.

- [x] (F) Create the GitHub repo `ridetrack-backend` (empty, no README), then `git remote add origin`, `git push -u origin main` and `dev` ([BACKEND.md](../design/BACKEND.md) Part A)
- [x] (F) Protect `main` and `dev` on the backend repo, same rules as the app repo
- [x] (F) Create the Firebase project: Email/Password auth, Firestore database, register a web app (`ridetrack`, ID `ridetrack-5ff36`)
- [ ] (F) `npm run deploy:rules` and `npm run deploy:indexes` from the backend repo
- [x] (F) `npm run seed`; confirm the 3 test users, routes, vehicles, schedules in the console
- [ ] (F) Test the security rules once per role (passenger, conductor, authority), including "users cannot change their own `role`"
- [ ] (F) Send the four keys (`apiKey`, `authDomain`, `projectId`, `appId`) to the team privately, never in the repo
- [ ] (All) Copy `.env.example` to `.env`, paste keys, run `npx expo start -c`, confirm the first screen says `Backend: connected to Firebase`
- [ ] (F) Auth in the app: sign-in reads `users/{uid}.role`, redirects to the role group, layouts guard each group (replaces the temporary role picker in `src/app/index.tsx`)
- [ ] (R) Passenger registration and login (creates `users/{uid}` with `role: passenger`)
- [ ] (S) Finish required status checks on both rulesets: `main-only-from-dev`, `dev-only-from-work-branches` (workflow must run once first)
- [ ] (S) Set `dev` as the default branch in GitHub Settings, General
- [ ] (S) Verify protection: a direct `git push origin main` and `dev` are rejected; a feature PR into `main` shows the failing check

## 2. Foundations and housekeeping

- [ ] (S) Align `src/constants/theme.ts` tokens with the Figma hi-fi prototype ([UI-GUIDE.md](../design/UI-GUIDE.md))
- [ ] (S) Replace each `PlaceholderScreen` with the real screen as owners build them; remove the role picker once real sign-in lands
- [ ] (S) Switch Home to live Firestore: change only the function bodies in `src/lib/home-data.ts`
- [x] (S) Maps key wired into the build: `.env.example`, `app.config.js`, `eas.json`, package name, Google provider ([MAPS-SETUP.md](../design/MAPS-SETUP.md))
- [ ] (F) Create the restricted Google Maps API key in Google Cloud and set it, plus the four Firebase values, in the EAS `preview` environment ([MAPS-SETUP.md](../design/MAPS-SETUP.md) Parts A and B)
- [ ] (F) Set Firestore rules before demo day; test mode expires after 30 days
- [ ] (F) Avoid Cloud Functions (paid plan); keep all logic in the app
- [ ] (F) Add composite indexes to `firestore.indexes.json` whenever a `type` filter plus sort asks for one
- [ ] (All) Run `npm run typecheck` before every PR; use `npx expo install <package>` for new packages
- [ ] (All) Share `src/lib/`, `src/store/`, shared components or schema changes in the group chat before editing

### Doc fixes spotted while reading the docs

- [ ] [UI-GUIDE.md](../design/UI-GUIDE.md): example imports `@/components/screen`, but the file is `src/components/ui/screen.tsx`; fix to `@/components/ui/screen`
- [ ] [TECH-INFO.md](../design/TECH-INFO.md): says "SDK 52 or newer"; the project is on SDK 57; update
- [ ] [TASKS.md](TASKS.md) line 74: the GIT-WORKFLOW link is duplicated; remove one
- [ ] [TECH-INFO.md](../design/TECH-INFO.md): the "Test accounts" section points to the Readme; link [BACKEND.md](../design/BACKEND.md) instead (that is where the emails and password are)
- [ ] [TRACEABILITY.md](TRACEABILITY.md): replace every `_fill in_` with the exact FR1 to FR12 wording from the requirements document, then confirm the screen-level mapping
- [ ] [TESTING.md](../process/TESTING.md): add a `Req` column and give every case a requirement id
- [ ] [DATA-MODEL.md](../design/DATA-MODEL.md) and the backend `firestore.rules`/`seed.mjs`: keep both in step on every change

## 3. App development: 42 screens

Each screen needs at least 2 working CRUD operations ([SCREENS.md](SCREENS.md)). Screens never call Firebase directly; use `src/lib/`. Passenger vehicle screens filter by the chosen transport (`where('type', '==', transport)`).

### Passenger: search and tracking (S), FR3, FR4, FR7

- [x] 1 Home (R nearby vehicles, R alerts, C/D saved routes, U change transport), sample data
- [x] 2 Select Transport (R types, C/U saved choice), first screen, redirect on first launch
- [ ] 3 Search: R routes, C/D recent searches, filtered by transport
- [ ] 4 Results: R schedules, U sort
- [ ] 5 Filter & Sort: U filters, R options
- [ ] 6 Transport Details `transport/[id].tsx`: R vehicle, C/D favourite
- [ ] 7 Route & Stops `route/[id].tsx`: R stops, C/D favourite (map with stops)
- [ ] 8 Live Tracking `track/[id].tsx`: R live location via `onSnapshot`, C/D follow vehicle, moving marker
- [ ] Vehicle location simulator/seed that moves positions along a route for the demo ([ARCHITECTURE.md](../design/ARCHITECTURE.md) Live tracking)

### Passenger: booking, tickets, profile (R), FR1, FR2, FR5, FR8, FR11, FR12

- [ ] 9 Confirm Journey: R schedule, U seats
- [ ] 10 Passenger Details: C/U passengers (React Hook Form + Zod validation)
- [ ] 11 Payment: C booking, U status (simulated, writes `paymentRef`)
- [ ] 12 Booking Confirmation: R booking
- [ ] 13 Digital Ticket: R booking, R QR (`react-native-qrcode-svg`, QR encodes the booking id)
- [ ] 14 My Tickets: R bookings, D remove from list
- [ ] 15 Ticket Details: R booking, U passenger name
- [ ] 16 Cancel Booking: U status to `cancelled`, D booking
- [ ] 17 Journey History: R bookings, D clear entry
- [ ] 18 Notifications: R alerts (live listener), U mark read
- [ ] 19 Profile: R/U user, D account (cannot change `role`)
- [ ] Booking draft kept in a Zustand store (`src/store/`)

### Conductor (H), FR2, FR6, FR7, FR8

- [ ] 20 Staff Login: R user, U session, role check (reject non-conductors)
- [ ] 21 Dashboard: R journeys, R incidents
- [ ] 22 Assigned Journey `journey/[id].tsx`: R schedule, U status
- [ ] 23 Scan Ticket: `expo-camera` barcode scan, R booking, U status
- [ ] 24 Valid: R booking, U passenger count
- [ ] 25 Invalid: R reason, C incident
- [ ] 26 Passenger List: R bookings, U boarded, boarded count
- [ ] 27 Report Incident: C incident, U draft (types: delay, breakdown, safety, other)
- [ ] 28 Incident Reported: R incident, D withdraw
- [ ] 29 Journey Completion: U schedule, R summary
- [ ] Update the conductor's vehicle `location` during a journey
- [ ] Block reuse: a ticket with status `used` must open Invalid

### Authority (F), FR8, FR9, FR10

- [ ] 30 Dashboard: R counts, R alerts
- [ ] 31 Vehicle Mgmt: R, U, D vehicles
- [ ] 32 Add Vehicle `vehicles/new.tsx`: C vehicle, U (form validation)
- [ ] 33 Routes: R, U, D routes
- [ ] 34 Stops: C, U, D stops
- [ ] 35 Schedule: C, U, D schedules (copy route `type` into the schedule)
- [ ] 36 Fare & Facilities: R, U fare and facilities
- [ ] 37 Preview & Publish: R draft, U `published`
- [ ] 38 Live Operations: R vehicle locations on a map, U status
- [ ] 39 Incident Mgmt: R incidents (live), U status
- [ ] 40 Review Incident `incidents/[id].tsx`: R incident, U resolve (`open`, `reviewed`, `resolved`)
- [ ] 41 Create Alert `alerts/new.tsx`: C alert, U draft (optional `routeId`, null means all routes)
- [ ] 42 Alert Published `alerts/[id].tsx`: R alert, D withdraw

### Cross-role integration

- [ ] QR: passenger ticket scanned and validated by conductor (R + H)
- [ ] Incident: conductor reports, authority Incident Mgmt receives it live (H + F)
- [ ] Alert: authority publishes, passenger Notifications updates live (F + R)

## 4. Per-member checklists (from MEMBERS.md)

### Silva (leader)

- [ ] Home on live Firestore data
- [ ] Search with recent searches, Results with Filter & Sort
- [ ] Transport Details and Route & Stops with favourites
- [ ] Live Tracking map with real-time marker
- [ ] Functional tests for this area
- [ ] Coordinate usability testing (5+ participants)
- [ ] Merge reviews; release APK link in the Readme

### Rajapaksha

- [ ] Registration and login
- [ ] Booking flow, payment, confirmation, QR ticket
- [ ] My Tickets, Ticket Details, Cancel Booking, Journey History
- [ ] Notifications listening to `alerts`; Profile edit and delete
- [ ] Functional tests for this area

### Herath

- [ ] Staff Login, Dashboard, Assigned Journey
- [ ] Scan Ticket, Valid and Invalid, mark used
- [ ] Passenger List, Report Incident, Journey Completion
- [ ] Location updates during a journey
- [ ] Functional tests for this area
- [ ] Complete the traceability matrix (owner per TASKS.md)

### Fernando

- [ ] Backend repo pushed, Firebase project, rules, seed (section 1)
- [ ] Auth with `role` and route guards
- [ ] All 13 authority screens
- [ ] Functional tests for this area
- [ ] Build the release APK

## 5. Testing

### Functional ([TESTING.md](../process/TESTING.md))

- [ ] Run and record F1 to F18 (all start as "Not run"); keep screenshots as evidence
- [ ] Add cases for every screen's CRUD pair so all 42 screens are covered, especially Conductor and Authority screens (only F6 to F9 exist now)
- [ ] Add cases for: Payment validation, Passenger Details validation, Profile delete, Notifications mark read, Alert withdraw, Incident resolve, Journey Completion
- [ ] Device test: Android phone via Expo Go and the final APK
- [ ] Each case names its requirement (FR1 to FR12)

### Integration

- [ ] I1 QR scan: passenger books, conductor scans, Valid, status `used`
- [ ] I2 QR reuse: same ticket again shows Invalid
- [ ] I3 Incident: conductor reports, authority sees it without refresh
- [ ] I4 Alert: authority creates, passenger Notifications updates live
- [ ] Security: F10 passenger opens a conductor route and is redirected; verify Firestore rules block cross-role writes

### Usability ([USABILITY-TESTING.md](../process/USABILITY-TESTING.md))

- [ ] Adjust tasks T0 to T6 to the exact requirement wording
- [ ] Recruit 5 or more participants covering all three roles (note proxy users)
- [ ] Prepare consent wording, task sheets and the SUS questionnaire
- [ ] Run moderated think-aloud sessions on the working build (one facilitator, one note-taker); note the build version per session
- [ ] Record task success, time on task and errors per task
- [ ] Fill the Participants, Results, SUS and Issues tables only after sessions really happen
- [ ] Fix or plan fixes for each issue (U1, U2, ...); keep before/after screenshots
- [ ] Compare with the earlier prototype test results to show improvement
- [ ] Keep recordings, completed task sheets and questionnaires

### Traceability ([TRACEABILITY.md](TRACEABILITY.md))

- [ ] For FR1 to FR12 fill: Figma frame, implemented file, test case ids, usability task, status
- [ ] Check every requirement has at least one screen and one test case
- [ ] Check every test case names a requirement
- [ ] Verify every screen has at least 2 working CRUD operations; update [SCREENS.md](SCREENS.md) if the final operations differ

### Defects

- [ ] Log every defect in the Bug log (ID, description, severity, owner, status)
- [ ] Bug-fix pass on `fix/<member>/<task>` branches from test results
- [ ] Re-test fixes

## 6. Release

- [ ] (All) All planned screens merged into `dev` and tested
- [ ] (S) Compare `dev` with `main` (`https://github.com/sithira-janiya/RideTrack/compare/main...dev`) and read the diff
- [ ] (S) PR from `dev` into `main` (the only PR `main` accepts); team checks a clean clone, then approves
- [ ] (S) Clean-clone check: Readme steps work, no `.env` or keys in the repo
- [ ] (F) `eas build -p android --profile preview` from `main`
- [ ] (S) Tag the release (for example `v1.0.0`)
- [ ] (S) Add the APK link to the Readme links table
- [ ] (All) Final smoke test of the APK on a real phone with the three test accounts
- [ ] (All) Final docs pass: tick everything in [MEMBERS.md](MEMBERS.md) and [TASKS.md](TASKS.md), update the update log

## 7. Ongoing rules (every PR)

- [ ] Branch as `feature/<surname>/<task>` or `fix/<surname>/<task>` from `dev`; PR into `dev` only; at least one teammate reviews and runs the app
- [ ] Commit format `type(area): summary`
- [ ] Tick tasks in MEMBERS.md and TASKS.md in the same PR; add a line to the TASKS update log
- [ ] Update the matching doc when screens, data or setup change
- [ ] Never commit `.env` or keys; if one leaks, tell the group and rotate it
- [ ] Delete the feature branch after merge; keep `dev` runnable with `npx expo start`

---

## Suggested order of work

| Step | What | Owner | Needs |
|---|---|---|---|
| 1 | Backend live (section 1) | F | none |
| 2 | Sign-in, role guards, registration | F, R | Step 1 |
| 3 | Search, Results, Filter, Details, Route & Stops | S | Seeded data |
| 4 | Authority screens (data entry), simulator | F | Step 2 |
| 5 | Booking flow and ticket | R | Schedules from Step 4 |
| 6 | Conductor scan, passengers, incidents | H | Tickets from Step 5 |
| 7 | Live Tracking and Live Operations | S, F | Simulator |
| 8 | Alerts and Notifications | F, R | Step 4 |
| 9 | Integration tests, bug fixes | All | Steps 3 to 8 |
| 10 | Usability testing, traceability | S, H | Working build |
| 11 | Release | S, F | All of the above |
