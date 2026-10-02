# RideTrack Task List

Project-wide status, newest work first. Per-member task lists are in [MEMBERS.md](MEMBERS.md).

Legend: `[x]` Done, `[ ]` To do. Owners: **S** Silva, **R** Rajapaksha, **H** Herath, **F** Fernando.

> Design phases (requirements, low-fi, hi-fi, user testing) are done per the project history; the app itself is still to be built, and the repo currently holds docs only.

---

## Phase 4: Release

- [ ] Release APK built with `eas build -p android --profile preview` (F)
- [ ] APK link added to the Readme links table (S)
- [ ] Clean-clone check: Readme steps work, no `.env` or keys in the repo (S)
- [ ] Final bug-fix pass (All)

## Phase 3: Testing

- [ ] Functional test cases run per area, results in [TESTING.md](TESTING.md) (All)
- [ ] Traceability matrix completed ([TRACEABILITY.md](TRACEABILITY.md)) (H)
- [ ] Integration: ticket scan, incident report, alert delivery (All)
- [ ] Usability test with 5 or more participants ([USABILITY-TESTING.md](USABILITY-TESTING.md)) (S)
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
- [ ] Home, Select Transport
- [ ] Search, Results, Filter & Sort
- [ ] Transport Details, Route & Stops
- [ ] Live Tracking

**Cross-role integration**
- [ ] Alert: authority publishes, passenger Notifications updates live (F + R)
- [ ] Incident: conductor reports, authority Incident Mgmt receives it (H + F)
- [ ] QR: passenger ticket scanned and validated by conductor (R + H)

## Phase 1: Project setup

- [ ] Expo + TypeScript project scaffolded (S)
- [ ] Expo Router, React Native Paper, Zustand installed (S)
- [ ] Shared theme from the hi-fi prototype (S)
- [ ] GitHub repo created with `main` and `dev`, branch protection set (S)
- [ ] Firebase project, Auth, Firestore rules (F)
- [ ] Seed script and `.env.example` (F)
- [x] Readme written
- [x] Docs folder created

## Phase 0: Design (done)

- [x] Problem statement, users and personas
- [x] Functional requirements FR1 to FR12
- [x] Task analysis and user flows
- [x] Low-fi prototype in Figma
- [x] Hi-fi prototype of all 42 screens in Figma
- [x] User-testing sessions on the prototype recorded and analysed
- [x] Work split across four members
