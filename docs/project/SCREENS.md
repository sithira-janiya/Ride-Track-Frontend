# Screens

42 screens. Each needs at least 2 working CRUD operations (C create, R read, U update, D delete). File paths are the planned Expo Router files. Passenger tab screens live in `src/app/(passenger)/(tabs)/`; Select Transport sits beside the tabs.

**Transport rule:** every passenger screen that lists or tracks vehicles (Search, Results, Filter & Sort, Transport Details, Route & Stops, Live Tracking, and Home suggestions) shows only the type chosen in Select Transport.

## Search and tracking (Silva), FR3, FR4, FR7

| # | Screen | File | CRUD |
|---|---|---|---|
| 1 | Home | `src/app/(passenger)/(tabs)/index.tsx` | R nearby vehicles, R alerts, C/D saved routes, U change transport. Built with sample data; Firestore wiring pending. |
| 2 | Select Transport | `src/app/(passenger)/select-transport.tsx` | R types, C/U saved choice (bus or train). **First screen for a new passenger.** |
| 3 | Search | `search.tsx` | R routes, C/D recent searches |
| 4 | Results | `results.tsx` | R schedules, U sort |
| 5 | Filter & Sort | `filter.tsx` | U filters, R options |
| 6 | Transport Details | `transport/[id].tsx` | R vehicle, C/D favourite |
| 7 | Route & Stops | `route/[id].tsx` | R stops, C/D favourite |
| 8 | Live Tracking | `track/[id].tsx` | R live location, C/D follow vehicle |

## Booking and tickets (Rajapaksha), FR1, FR2, FR5, FR8, FR11, FR12

| # | Screen | File | CRUD |
|---|---|---|---|
| 9 | Confirm Journey | `book/confirm.tsx` | R schedule, U seats |
| 10 | Passenger Details | `book/passengers.tsx` | C/U passengers |
| 11 | Payment | `book/payment.tsx` | C booking, U status |
| 12 | Booking Confirmation | `book/done.tsx` | R booking |
| 13 | Digital Ticket | `ticket/[id].tsx` | R booking, R QR |
| 14 | My Tickets | `tickets.tsx` | R bookings, D remove from list |
| 15 | Ticket Details | `ticket/[id]/details.tsx` | R booking, U passenger name |
| 16 | Cancel Booking | `ticket/[id]/cancel.tsx` | U status, D booking |
| 17 | Journey History | `history.tsx` | R bookings, D clear entry |
| 18 | Notifications | `notifications.tsx` | R alerts, U mark read |
| 19 | Profile | `profile.tsx` | R/U user, D account |

## Conductor (Herath), FR2, FR6, FR7, FR8

| # | Screen | File | CRUD |
|---|---|---|---|
| 20 | Staff Login | `src/app/(conductor)/login.tsx` | R user, U session |
| 21 | Dashboard | `index.tsx` | R journeys, R incidents |
| 22 | Assigned Journey | `journey/[id].tsx` | R schedule, U status |
| 23 | Scan Ticket | `scan.tsx` | R booking, U status |
| 24 | Valid | `valid.tsx` | R booking, U passenger count |
| 25 | Invalid | `invalid.tsx` | R reason, C incident |
| 26 | Passenger List | `passengers.tsx` | R bookings, U boarded |
| 27 | Report Incident | `report.tsx` | C incident, U draft |
| 28 | Incident Reported | `reported.tsx` | R incident, D withdraw |
| 29 | Journey Completion | `complete.tsx` | U schedule, R summary |

## Authority (Fernando), FR8, FR9, FR10

| # | Screen | File | CRUD |
|---|---|---|---|
| 30 | Dashboard | `src/app/(authority)/index.tsx` | R counts, R alerts |
| 31 | Vehicle Mgmt | `vehicles.tsx` | R, U, D vehicles |
| 32 | Add Vehicle | `vehicles/new.tsx` | C vehicle, U |
| 33 | Routes | `routes.tsx` | R, U, D routes |
| 34 | Stops | `stops.tsx` | C, U, D stops |
| 35 | Schedule | `schedule.tsx` | C, U, D schedules |
| 36 | Fare & Facilities | `fare.tsx` | R, U fare and facilities |
| 37 | Preview & Publish | `publish.tsx` | R draft, U published |
| 38 | Live Operations | `live.tsx` | R vehicle locations, U status |
| 39 | Incident Mgmt | `incidents.tsx` | R incidents, U status |
| 40 | Review Incident | `incidents/[id].tsx` | R incident, U resolve |
| 41 | Create Alert | `alerts/new.tsx` | C alert, U draft |
| 42 | Alert Published | `alerts/[id].tsx` | R alert, D withdraw |

CRUD columns are the planned minimum; adjust if a screen ends up with different operations, and keep this table honest for the testing chapter.
