# Member-wise Features and Tasks

Each member owns one area of the app. Every screen needs at least 2 working CRUD operations (see [SCREENS.md](SCREENS.md)). Tick `[x]` when merged to `main`.

---

## Silva D S J (IT23652200), Team leader
**Passenger search & live tracking.** Requirements: FR3, FR4, FR7. Folder: `src/app/(passenger)/` (search and tracking screens).

### Features
- Choose bus or train at the start; the whole passenger app then shows only that type
- Search routes, view results, filter and sort
- View transport and route details with stops
- Live vehicle tracking on a map

### Screens (8)
Home, Select Transport, Search, Results, Filter & Sort, Transport Details, Route & Stops, Live Tracking

### Tasks
- [x] Scaffold Expo + TypeScript project, install shared packages
- [x] Shared theme and navigation shell
- [x] Restyle passenger screens to the Milestone 2 hi-fi prototype (navy header, cards, pills, Select Transport, Home, Search, Results, Filter & Sort)
- [x] Create GitHub repo with `main` and `dev` branches
- [x] Add `.env.example`
- [x] Protect `main` and `dev` on GitHub (pull requests required), see [GIT-WORKFLOW.md](../process/GIT-WORKFLOW.md#branch-protection-setup)
- [x] Add workflow so `main` accepts pull requests only from `dev`
- [ ] Add the two branch-rule checks as required status checks in the GitHub rulesets
- [x] Select Transport (first screen, saved choice, redirect on first launch)
- [x] Home: current transport with Change button, alerts, nearby vehicles, saved routes (bookmark add/remove) and popular routes, all filtered by the chosen transport (uses sample data)
- [x] Connect Home to live Firestore data (vehicles, routes, alerts), with sample fallback; checked on the local emulators
- [ ] Confirm Home on the real Firebase project with the keys and the test password in `.env`
- [x] Connect Search, Results, Transport Details, Route & Stops and Live Tracking to Firestore (Search suggestions, Results, Transport Details, Route & Stops and Live Tracking done)
- [x] Search with recent searches (create/delete), filtered by chosen transport
- [x] Results (trips between two places, times, duration, fare, status) with Filter & Sort (sort by earliest, cheapest, shortest; filter by time of day and on time only); sample data
- [x] Transport Details and Route & Stops with save-route bookmark (opened from a Results card; Live Tracking is a starter screen)
- [x] Live Tracking map with a moving vehicle marker (positions from the sample timetable; demo simulation)
- [x] Live Tracking: reads real positions from Firestore (`vehicles/{id}.location`), timetable fallback; the backend simulator (`npm run simulate`) makes it move
- [ ] Functional tests for this area (cases F1 to F95 written, 34 automated logic checks pass; run the screens on a phone and record results)
- [ ] Coordinate usability testing (5+ participants)
- [ ] Merge reviews and release APK link in Readme

---

## Rajapaksha M.P.K (IT23665620)
**Booking, tickets & profile.** Requirements: FR1, FR2, FR5, FR8, FR11, FR12.

### Features
- Confirm journey, enter passenger details, simulated payment
- Booking confirmation and QR digital ticket
- View, open and cancel tickets
- Journey history
- Receive authority alerts in Notifications
- Profile management

### Screens (11)
Confirm Journey, Passenger Details, Payment, Booking Confirmation, Digital Ticket, My Tickets, Ticket Details, Cancel Booking, Journey History, Notifications, Profile

### Tasks
- [ ] Passenger registration and login
- [ ] Booking flow: Confirm Journey, Passenger Details (form validation)
- [ ] Simulated Payment and Booking Confirmation
- [ ] Digital Ticket with QR code
- [ ] My Tickets and Ticket Details
- [ ] Cancel Booking
- [ ] Journey History
- [ ] Notifications listening to `alerts` (live)
- [ ] Profile edit and delete account
- [ ] Functional tests for this area

---

## Herath H.M.S.G (IT23634626)
**Conductor / inspector.** Requirements: FR2, FR6, FR7, FR8. Folder: `src/app/(conductor)/`.

### Features
- Staff sign-in
- View assigned journey
- Scan and validate QR tickets (Valid / Invalid results)
- Passenger list and count
- Report incidents and delays
- Complete a journey

### Screens (10)
Staff Login, Dashboard, Assigned Journey, Scan Ticket, Valid, Invalid, Passenger List, Report Incident, Incident Reported, Journey Completion

### Tasks
- [ ] Staff Login with role check
- [ ] Dashboard and Assigned Journey
- [ ] Scan Ticket with `expo-camera`, load booking from QR
- [ ] Valid and Invalid screens, mark ticket used, block reuse
- [ ] Passenger List with boarded count
- [ ] Report Incident and Incident Reported
- [ ] Journey Completion
- [ ] Update vehicle location during journey
- [ ] Functional tests for this area

---

## Fernando H L R D (IT23635302)
**Transport authority + shared database.** Requirements: FR8, FR9, FR10. Folder: `src/app/(authority)/`, `src/lib/`, `scripts/`.

### Features
- Manage vehicles, routes, stops, schedules, fares and facilities
- Preview and publish changes
- Live operations view of the whole network
- Review and resolve incidents
- Create and publish alerts

### Screens (13)
Dashboard, Vehicle Mgmt, Add Vehicle, Routes, Stops, Schedule, Fare & Facilities, Preview & Publish, Live Operations, Incident Mgmt, Review Incident, Create Alert, Alert Published

### Tasks
- [x] Backend repo `ridetrack-backend` prepared locally (security rules, indexes, seed script, setup guide); see [BACKEND.md](../design/BACKEND.md)
- [x] Mobile connection module `src/lib/firebase.ts` and updated `.env.example`
- [x] Push `ridetrack-backend` to GitHub with `main` and `dev`, protect both
- [x] Create Firebase project `ridetrack` (ID `ridetrack-5ff36`) with Email/Password auth and Firestore
- [ ] Share the four Firebase keys with the team privately
- [ ] Deploy rules and indexes (`npm run deploy:rules`) and test rules against each role
- [x] Run the seed (`npm run seed`); console shows `alerts`, `routes`, `schedules`, `users`, `vehicles` and the 3 test users
- [ ] Auth in the app with `role` field and route guards
- [ ] Vehicle Mgmt and Add Vehicle
- [ ] Routes, Stops, Schedule, Fare & Facilities
- [ ] Preview & Publish
- [ ] Live Operations map
- [ ] Incident Mgmt and Review Incident
- [ ] Create Alert and Alert Published
- [ ] Functional tests for this area

---

## Shared tasks

- [ ] Integration test: ticket scan (Rajapaksha + Herath)
- [ ] Integration test: incident to authority (Herath + Fernando)
- [ ] Integration test: alert to passengers (Fernando + Rajapaksha)
- [ ] Bug-fix pass from test results
- [ ] Release APK built and linked
