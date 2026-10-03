# RideTrack Task List

Project-wide status, newest work first. Per-member task lists are in [MEMBERS.md](MEMBERS.md).

Legend: `[x]` Done, `[ ]` To do. Owners: **S** Silva, **R** Rajapaksha, **H** Herath, **F** Fernando.

> Design phases (requirements, low-fi, hi-fi, user testing) are done per the project history. The app shell is set up (project, packages, theme, role navigation with placeholder tabs); the 42 real screens and the Firebase backend are still to be built.

**Progress snapshot (3 Oct 2026):** Phase 0 design done. Phase 1 setup mostly done; open items are the required status checks in the rulesets, Figma token alignment, Firebase and the seed script. Phases 2 to 4 not started.

---

## Phase 4: Release

- [ ] Release APK built with `eas build -p android --profile preview` (F)
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
- [ ] Home: switch from sample data to live Firestore data (S, after F's backend)
- [ ] Search, Results, Filter & Sort
- [ ] Transport Details, Route & Stops
- [ ] Live Tracking

**Cross-role integration**
- [ ] Alert: authority publishes, passenger Notifications updates live (F + R)
- [ ] Incident: conductor reports, authority Incident Mgmt receives it (H + F)
- [ ] QR: passenger ticket scanned and validated by conductor (R + H)

## Phase 1: Project setup

- [x] Expo + TypeScript project scaffolded (S)
- [x] Expo Router, React Native Paper, Zustand and other shared packages installed (S)
- [x] Shared theme and role navigation shell, see [UI-GUIDE.md](../design/UI-GUIDE.md) (S)
- [ ] Set up ESLint (`npx expo install eslint eslint-config-expo`) so `npx expo lint` works (S)
- [ ] Align theme tokens with the Figma hi-fi prototype (S)
- [x] GitHub repo created with `main` and `dev` branches (S)
- [x] Branch protection on `main` and `dev`, pull requests required (S)
- [x] Workflow `.github/workflows/branch-rules.yml`: PRs into `main` only from `dev`, PRs into `dev` only from feature, fix or docs branches (S)
- [ ] Add the checks `main-only-from-dev` and `dev-only-from-work-branches` as required status checks in the GitHub rulesets (S), see [GIT-WORKFLOW.md](../process/GIT-WORKFLOW.md#branch-protection-setup), see [GIT-WORKFLOW.md](../process/GIT-WORKFLOW.md#branch-protection-setup)
- [ ] Firebase project, Auth, Firestore rules (F)
- [x] `.env.example` added (S)
- [ ] Seed script (F)
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
