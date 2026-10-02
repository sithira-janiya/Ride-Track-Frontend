# Member-wise Features and Tasks

Each member owns one area of the app. Every screen needs at least 2 working CRUD operations (see [SCREENS.md](SCREENS.md)). Tick `[x]` when merged to `main`.

---

## Silva D S J (IT23652200), Team leader
**Passenger search & live tracking.** Requirements: FR3, FR4, FR7. Folder: `src/app/(passenger)/` (search and tracking screens).

### Features
- Choose bus or train
- Search routes, view results, filter and sort
- View transport and route details with stops
- Live vehicle tracking on a map

### Screens (8)
Home, Select Transport, Search, Results, Filter & Sort, Transport Details, Route & Stops, Live Tracking

### Tasks
- [x] Scaffold Expo + TypeScript project, install shared packages
- [ ] Shared theme and navigation shell
- [ ] Create GitHub repo with `main` and `dev` branches, protect both (PRs required), add `.env.example`
- [ ] Home and Select Transport
- [ ] Search with recent searches (create/delete)
- [ ] Results with Filter & Sort
- [ ] Transport Details and Route & Stops with favourites
- [ ] Live Tracking map with real-time marker
- [ ] Functional tests for this area
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
- [ ] Create Firebase project, share keys privately
- [ ] Firestore collections and security rules per role
- [ ] Auth with `role` field and route guards
- [ ] Seed script `npm run seed`
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
