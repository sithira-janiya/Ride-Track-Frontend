# RideTrack Task List

Project-wide status, newest work first. Per-member task lists are in [MEMBERS.md](MEMBERS.md).

Legend: `[x]` Done, `[ ]` To do. Owners: **S** Silva, **R** Rajapaksha, **H** Herath, **F** Fernando.

> Design phases (requirements, low-fi, hi-fi, user testing) are done per the project history. The app shell is set up (project, packages, theme, role navigation with placeholder tabs); the 42 real screens and the Firebase backend are still to be built.

**Progress snapshot (3 Oct 2026):** Phase 0 design done. Phase 1 setup mostly done; open items are the required status checks in the rulesets, Figma token alignment, deploying and testing Firestore rules, and sharing the keys. Phases 2 to 4 not started.

---

## Phase 4: Release

- [x] Build config ready for the APK: `eas.json`, `app.config.js`, package name, maps plugin ([MAPS-SETUP.md](../design/MAPS-SETUP.md))
- [ ] Create the restricted Google Maps API key and set it in EAS (project owner, MAPS-SETUP Parts A and B)
- [ ] Release APK built with `npm run build:apk` (F)
- [ ] APK link added to the Readme links table (S)
- [ ] Clean-clone check: Readme steps work, no `.env` or keys in the repo (S)
- [ ] Final bug-fix pass (All)

## Phase 3: Testing

- [ ] Functional test cases run per area, results in [TESTING.md](../process/TESTING.md) (All)
- [ ] Traceability matrix completed ([TRACEABILITY.md](TRACEABILITY.md)) (H)
- [ ] Integration: ticket scan, incident report, alert delivery (All)
- [ ] Usability test with 5 or more participants ([USABILITY-TESTING.md](../process/USABILITY-TESTING.md)) (S)
- [ ] Defects and usability issues logged with fixes (All)
- [ ] Verify every screen has at least 2 working CRUD operations (All)

## Phase 2: App development (42 screens)

**Authority, 13 screens (F)**
- [ ] Dashboard, Vehicle Mgmt, Add Vehicle
- [ ] Routes, Stops, Schedule, Fare & Facilities
- [ ] Preview & Publish, Live Operations
- [ ] Incident Mgmt, Review Incident
- [ ] Create Alert, Alert Published

**Conductor, 10 screens (H)**
- [ ] Staff Login, Dashboard, Assigned Journey
- [ ] Scan Ticket, Valid, Invalid
- [ ] Passenger List
- [ ] Report Incident, Incident Reported
- [ ] Journey Completion

**Booking and tickets, 11 screens (R)**
- [ ] Confirm Journey, Passenger Details
- [ ] Payment, Booking Confirmation
- [ ] Digital Ticket, My Tickets, Ticket Details
- [ ] Cancel Booking, Journey History
- [ ] Notifications, Profile

**Search and tracking, 8 screens (S)**
- [x] Select Transport (bus or train, first screen)
- [x] Home (alerts, nearby vehicles, saved and popular routes, filtered by transport; sample data)
- [x] Home reads live Firestore data (vehicles, published routes, alerts; real-time; sample fallback). Checked on the local emulators; still to confirm on the real project with the keys (S)
- [ ] Replace the temporary test sign-in (`src/lib/dev-auth.ts`) with real login, then delete it (F + R)
- [ ] Switch Search, Results, Transport Details, Route & Stops and Live Tracking to Firestore (S)
- [x] Search (From/To with place suggestions, swap, recent searches add/remove/clear, filtered by transport; sample data)
- [x] Results and Filter & Sort (sort: earliest, cheapest, shortest; filter: time of day, on time only; empty states; sample data)
- [x] Transport Details and Route & Stops (trip summary, fare, seats, facilities, route timeline, save-route bookmark; sample data)
- [x] Live Tracking (map, route line, stops, moving vehicle marker, ETA tiles, demo simulation; sample timetable positions)
- [ ] Live Tracking: read real vehicle positions from Firestore `vehicles/{id}.location` once the backend position simulator exists (S + F)

**Cross-role integration**
- [ ] Alert: authority publishes, passenger Notifications updates live (F + R)
- [ ] Incident: conductor reports, authority Incident Mgmt receives it (H + F)
- [ ] QR: passenger ticket scanned and validated by conductor (R + H)

## Phase 1: Project setup

- [x] Expo + TypeScript project scaffolded (S)
- [x] Expo Router, React Native Paper, Zustand and other shared packages installed (S)
- [x] Shared theme and role navigation shell, see [UI-GUIDE.md](../design/UI-GUIDE.md) (S)
- [ ] Set up ESLint (`npx expo install eslint eslint-config-expo`) so `npx expo lint` works (S)
- [x] Theme and interfaces aligned with the Milestone 2 hi-fi prototype: navy headers, blue actions, pills, cards, Select Transport, Home, Search, Results, Filter & Sort (S)
- [ ] Check theme values and remaining screens against the Figma file (S)
- [x] GitHub repo created with `main` and `dev` branches (S)
- [x] Branch protection on `main` and `dev`, pull requests required (S)
- [x] Workflow `.github/workflows/branch-rules.yml`: PRs into `main` only from `dev`, PRs into `dev` only from feature, fix or docs branches (S)
- [ ] Add the checks `main-only-from-dev` and `dev-only-from-work-branches` as required status checks in the GitHub rulesets (S), see [GIT-WORKFLOW.md](../process/GIT-WORKFLOW.md#branch-protection-setup), see [GIT-WORKFLOW.md](../process/GIT-WORKFLOW.md#branch-protection-setup)
- [x] Backend repo `ridetrack-backend` prepared locally: rules, indexes, seed script, guide (F)
- [x] App connection to Firebase: `src/lib/firebase.ts`, `.env.example`, [BACKEND.md](../design/BACKEND.md) (F)
- [x] Push backend repo to GitHub and protect branches (F)
- [x] Firebase project `ridetrack` (ID `ridetrack-5ff36`) created, seed run: collections and 3 test users confirmed in the console (F)
- [ ] Deploy rules and indexes and test rules per role (F)
- [x] `.env.example` added (S)
- [x] Readme written
- [x] Docs folder created
- [x] Repository folder structure cleaned (grouped components and docs, editorconfig, gitattributes)

## Phase 0: Design (done)

- [x] Problem statement, users and personas
- [x] Functional requirements FR1 to FR12
- [x] Task analysis and user flows
- [x] Low-fi prototype in Figma
- [x] Hi-fi prototype of all 42 screens in Figma
- [x] User-testing sessions on the prototype recorded and analysed
- [x] Work split across four members

---

## Update log

Newest first. Add a line here whenever tasks or docs change.

| Date | Change | Docs touched |
|---|---|---|
| 3 Oct 2026 | Home switched to live Firestore data: real-time listeners for vehicles, published routes and alerts (always filtered by the chosen transport), falls back to sample data when the backend is off, nobody is signed in, an error happens or the connection is slow; Live data or Sample data label; temporary test sign-in from the role picker using the seeded accounts. Checked against the local emulators with the real rules and seed data | ARCHITECTURE, BACKEND, DATA-MODEL, TESTING, TASKS, MEMBERS, TODO, UI-GUIDE |
| 3 Oct 2026 | Google Maps key setup for the APK: `app.config.js` adds the maps plugin from `EXPO_PUBLIC_MAPS_API_KEY` and fails the EAS build if it is missing, `eas.json` build profiles, Android package `com.ridetrack.app`, Google provider on the tracking map, `npm run build:apk`, and the MAPS-SETUP guide (the key itself still has to be created in Google Cloud) | MAPS-SETUP, TECH-INFO, TASKS, TODO, docs index, Readme |
| 3 Oct 2026 | Live Tracking built: map with the route line, stop markers, a moving vehicle marker, travelled part highlighted, zoom, centre and whole-route buttons, LIVE pill, location, ETA and arrival tiles, updated-seconds label, and a demo simulation; position comes from the timetable (sample data) | SCREENS, ARCHITECTURE, TECH-INFO, TESTING, UI-GUIDE, MEMBERS, TASKS |
| 3 Oct 2026 | Transport Details and Route & Stops built: trip summary, journey information, fare, seats, facilities, route timeline with stop times and progress, save-route bookmark; result cards open Transport Details and show seats and facility chips; sample stops, seats and facilities added; Live Tracking starter screen | SCREENS, DATA-MODEL, TESTING, UI-GUIDE, ARCHITECTURE, MEMBERS, TASKS, Readme |
| 3 Oct 2026 | Theme and passenger interfaces restyled to match the Milestone 2 hi-fi prototype: navy header `Screen`, `SurfaceCard`, `StatusPill`, navy tab bar, Select Transport with Continue, Home with greeting and search card, Search with travel date and time chips, Results cards, Filter & Sort with fare and duration | UI-GUIDE, SCREENS, TASKS, MEMBERS, TESTING, ARCHITECTURE, Readme |
| 3 Oct 2026 | Results and Filter & Sort built: trips between two places with times, duration, fare and status; sort and filter sheet with live updates, empty states, reset; sample schedules added | MEMBERS, TASKS, SCREENS, TESTING, DATA-MODEL, ARCHITECTURE, Readme |
| 3 Oct 2026 | Search screen built: From/To inputs with suggestions, swap, validation, saved recent searches (add, remove, clear), always filtered by the chosen transport; Results starter screen added so Search can navigate | MEMBERS, TASKS, SCREENS, TESTING, ARCHITECTURE, Readme |
| 3 Oct 2026 | Firebase project `ridetrack` (ID `ridetrack-5ff36`) created and seeded: Firestore collections and 3 test users confirmed in the console | MEMBERS, TASKS, TODO, BACKEND |
| 3 Oct 2026 | Separate backend repo prepared (Firebase rules, indexes, seed, beginner setup guide); app gets `src/lib/firebase.ts`, new `.env.example`, a backend status line on the first screen, and the BACKEND guide | BACKEND, Readme, TECH-INFO, ARCHITECTURE, DATA-MODEL, MEMBERS, TASKS, docs index |
| 3 Oct 2026 | Folder tidy: removed empty `.gitkeep` files, moved sample data to `src/data/`, renamed `src/types/transport.ts` to `models.ts`, refreshed folder structure in Readme and ARCHITECTURE | Readme, ARCHITECTURE, UI-GUIDE, TASKS |
| 3 Oct 2026 | Added branch-rules workflow so `main` accepts pull requests only from `dev` and `dev` only from feature, fix or docs branches; documented ruleset steps and compare links | GIT-WORKFLOW, TASKS |
| 3 Oct 2026 | Home screen built: current transport and Change button, alerts, nearby vehicles, saved routes (add/remove) and popular routes, all filtered by transport; sample data layer in `src/lib` and shared types in `src/types` | MEMBERS, TASKS, SCREENS, ARCHITECTURE, UI-GUIDE, TESTING |
| 3 Oct 2026 | Repository folders cleaned: components grouped into `ui`, `navigation`, `transport`; docs grouped into `project`, `design`, `process`; `.editorconfig` and `.gitattributes` added | Readme, docs index, ARCHITECTURE, UI-GUIDE, all doc links |
| 3 Oct 2026 | Passenger chooses bus or train first; choice saved and used app-wide; passenger routes split into `select-transport` + `(tabs)`; Home and Search show the chosen type | Readme, SCREENS, ARCHITECTURE, DATA-MODEL, UI-GUIDE, MEMBERS, TASKS, TESTING, USABILITY-TESTING |
| 3 Oct 2026 | Repo with `main` and `dev` and `.env.example` marked done; branch protection steps documented (still open) | TASKS, MEMBERS, GIT-WORKFLOW |
| 3 Oct 2026 | Shared theme, `Screen`/`RoleTabs`/`PlaceholderScreen` components and role navigation shell added (placeholder tab screens for the three roles) | UI-GUIDE, TASKS, MEMBERS, Readme, docs index |
| 2 Oct 2026 | Expo (SDK 57) + TypeScript project scaffolded; shared packages installed; docs moved to the `src/` layout | TASKS, MEMBERS, ARCHITECTURE, SCREENS, GIT-WORKFLOW, Readme |
| 2 Oct 2026 | `dev` branch created; branch naming changed to `feature/<member>/<task>` | GIT-WORKFLOW, Readme, MEMBERS, TASKS |
| 2 Oct 2026 | Repo reorganised as the project's official README and docs; added per-member features and tasks | Readme, MEMBERS, TASKS, docs index |
| 2 Oct 2026 | Initial docs created (architecture, tech info, data model, screens, testing, Git workflow) | all docs |
