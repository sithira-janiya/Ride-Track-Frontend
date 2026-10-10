# Traceability Matrix

Links **requirement, hi-fi prototype, implementation and test cases**.

> Only the requirement ids (FR1 to FR12) are recorded per area so far. Copy each requirement's exact wording from the requirements document into the table below.

## Requirement to area

| Requirement | Wording | Area / owner | Screens implementing it |
|---|---|---|---|
| FR1 | _fill in_ | Booking & tickets (Rajapaksha) | Confirm Journey, Passenger Details, Payment, Booking Confirmation |
| FR2 | _fill in_ | Booking & tickets (Rajapaksha), Conductor (Herath) | Digital Ticket, My Tickets, Scan Ticket |
| FR3 | _fill in_ | Search & tracking (Silva) | Search, Results, Filter & Sort |
| FR4 | _fill in_ | Search & tracking (Silva) | Transport Details, Route & Stops |
| FR5 | _fill in_ | Booking & tickets (Rajapaksha) | Ticket Details, Cancel Booking |
| FR6 | _fill in_ | Conductor (Herath) | Passenger List, Journey Completion |
| FR7 | _fill in_ | Search & tracking (Silva), Conductor (Herath) | Live Tracking, Report Incident |
| FR8 | _fill in_ | Booking (Rajapaksha), Conductor (Herath), Authority (Fernando) | Notifications, Incident Reported, Incident Mgmt |
| FR9 | _fill in_ | Authority (Fernando) | Vehicle Mgmt, Routes, Schedule |
| FR10 | _fill in_ | Authority (Fernando) | Live Operations, Create Alert |
| FR11 | _fill in_ | Booking & tickets (Rajapaksha) | Journey History |
| FR12 | _fill in_ | Booking & tickets (Rajapaksha) | Profile |

The area-level assignment (FR3, FR4, FR7 to Silva; FR1, FR2, FR5, FR8, FR11, FR12 to Rajapaksha; FR2, FR6, FR7, FR8 to Herath; FR8, FR9, FR10 to Fernando) comes from the project plan. The screen-level mapping above is a draft; confirm it against the requirements document.

## Full matrix (complete while testing)

| Requirement | Hi-fi prototype screen (Figma frame) | Implemented file | Functional test cases | Usability task | Status |
|---|---|---|---|---|---|
| FR1 | | | | | Not started |
| FR2 | | | | | Not started |
| FR3 | Search, Results, Filter & Sort (Milestone 2 hi-fi) | `src/app/(passenger)/(tabs)/search.tsx`, `results.tsx`, `filter.tsx`, `src/hooks/use-places.ts`, `use-results.ts`, `src/lib/search-data.ts`, `results-filter.ts` | F1, F2, F19 to F52, F83 to F87 | T0, T1, T1b, T1c | Tests written, logic checks pass; phone run pending |
| FR4 | Transport Details, Route & Stops (Milestone 2 hi-fi) | `src/app/(passenger)/transport/[id].tsx`, `route/[id].tsx`, `src/hooks/use-trip-detail.ts`, `src/lib/trip-data.ts`, `trip-progress.ts` | F51 to F61, F85 to F90 | T1, T1c, T2b | Tests written, logic checks pass; phone run pending |
| FR5 | | | | | Not started |
| FR6 | | | | | Not started |
| FR7 | Live Tracking (Milestone 2 hi-fi) | `src/app/(passenger)/track/[id].tsx`, `src/hooks/use-live-trip.ts`, `src/lib/vehicle-position.ts`, backend `scripts/simulate.mjs` | F3, F56, F62 to F72, F91 to F95 | T2, T2c | Tests written, logic checks pass; phone run pending (Report Incident is Herath's) |
| FR8 | | | | | Not started |
| FR9 | | | | | Not started |
| FR10 | | | | | Not started |
| FR11 | | | | | Not started |
| FR12 | | | | | Not started |

Rules: every requirement has at least one screen and at least one test case; every test case in [TESTING.md](../process/TESTING.md) names a requirement.
