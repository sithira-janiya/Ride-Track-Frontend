# Screens

42 screens. Each needs at least 2 working CRUD operations (C create, R read, U update, D delete). File paths are the planned Expo Router files. Passenger tab screens live in `src/app/(passenger)/(tabs)/`; Select Transport sits beside the tabs.

**Transport rule:** every passenger screen that lists or tracks vehicles (Search, Results, Filter & Sort, Transport Details, Route & Stops, Live Tracking, and Home suggestions) shows only the type chosen in Select Transport.

## Fidelity to the Milestone 2 prototype

The passenger screens built so far follow the prototype layout and colours. Known differences, kept on purpose or for later:

| Prototype | Built app | Reason |
|---|---|---|
| Fare range slider | Fare chips (Any price, Up to Rs. 500, 1,000, 1,500) | No extra package needed; same effect |
| Available seats and facilities filters | Not built; seats and facility chips are shown on cards and details | Filtering by seats and facilities can follow |
| Track button on result cards | Whole card opens Transport Details, which has Track Vehicle | One clear tap target; Live Tracking itself is not built yet |
| Book Ticket on Transport Details | Disabled with a note | Booking screens are not built yet |
| Route preview inside Transport Details is a button to Route & Stops | Shows the stop list inline and a View full route button | Same information without an extra tap |
| Live location (near a stop, ETA) | Worked out from the timetable and the phone clock | Sample data has no GPS; real positions arrive with the backend |
| Map status filter chips (On time, Delayed, Disrupted) | Not shown; the vehicle's status pill is in the info panel | The screen follows one vehicle, so there is nothing to filter |
| Your own location on the map | Not shown | Needs the location permission package, which is not added yet |
| Road-following route line | Straight lines between stops | Sample data has stop coordinates only |
| Real-time vehicle movement | Moves along the route from the timetable; a Simulate trip button drives a whole trip in about 90 seconds | Lets the movement be demonstrated at any time of day |
| Pulsing Live indicator and last updated time (test finding UI-01) | LIVE pill with a pulsing dot and an Updated Ns ago label | Added from the Milestone 2 recommendation |
| Early morning departure chip | Morning, Afternoon, Evening and Night | Matches the four windows used by the filter |
| Bus/Train toggle only sets the search type | Toggle also changes the app-wide transport choice | Keeps Home, Search and Results consistent with the choose-bus-or-train-first rule |
| Travel date shapes results | Date is chosen, passed to Results and shown; sample schedules run daily | Real dated schedules arrive with Firestore |
| Upcoming Journey card on Home | Alerts, nearby vehicles, saved and popular routes | Bookings do not exist yet |

## Search and tracking (Silva), FR3, FR4, FR7

| # | Screen | File | CRUD |
|---|---|---|---|
| 1 | Home | `src/app/(passenger)/(tabs)/index.tsx` | R nearby vehicles, R alerts, C/D saved routes, U change transport. Built with sample data; Firestore wiring pending. |
| 2 | Select Transport | `src/app/(passenger)/select-transport.tsx` | R types, C/U saved choice (bus or train). **First screen for a new passenger.** |
| 3 | Search | `src/app/(passenger)/(tabs)/search.tsx` | R places and routes, C/D recent searches (built) |
| 4 | Results | `src/app/(passenger)/results.tsx` | R schedules, U sort (built) |
| 5 | Filter & Sort | `src/app/(passenger)/filter.tsx` (opens as a sheet over Results) | U filters, R options (built) |
| 6 | Transport Details | `src/app/(passenger)/transport/[id].tsx` | R trip, vehicle and facilities, C/D saved route (built) |
| 7 | Route & Stops | `src/app/(passenger)/route/[id].tsx` | R stops and progress, C/D saved route (built) |
| 8 | Live Tracking | `src/app/(passenger)/track/[id].tsx` (built) | R live location, C/D follow vehicle |

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
