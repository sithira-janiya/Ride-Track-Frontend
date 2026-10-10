# Testing

Status of every case starts as **Not run**. Update the Result column as you test and keep screenshots as evidence.

## Approach

| Type | What | Who |
|---|---|---|
| Functional | Each screen's CRUD operations work | Screen owner, then a teammate |
| Integration | The three cross-role flows | All, together |
| Usability (HCI) | Real users complete tasks on the working app | Silva coordinates |
| Device | Android phone via Expo Go and the final APK | All |

## Functional cases (sample)

| ID | Area | Case | Expected | Result |
|---|---|---|---|---|
| F1 | Search | Search "Colombo" to "Kandy" | Matching schedules listed | Not run |
| F2 | Search | Apply filter and sort | List updates | Not run |
| F3 | Tracking | Open Live Tracking | Marker moves as location updates | Not run |
| F4 | Booking | Complete booking with payment | Booking saved, QR shown | Not run |
| F5 | Booking | Cancel booking | Status becomes cancelled | Not run |
| F6 | Conductor | Staff login with wrong password | Error shown, no access | Not run |
| F7 | Conductor | Report incident | Incident stored | Not run |
| F8 | Authority | Add vehicle | Appears in Vehicle Mgmt | Not run |
| F9 | Authority | Publish route | Visible to passengers | Not run |
| F10 | Security | Passenger opens conductor route | Redirected away | Not run |
| F11 | Transport | First launch as passenger | Select Transport shown before Home | Not run |
| F12 | Transport | Choose Bus | Home says bus; Search shows bus only | Not run |
| F13 | Transport | Close and reopen the app | Choice is remembered, Home opens directly | Not run |
| F14 | Transport | Home, Change transport, choose Train | Home and Search switch to train | Not run |
| F15 | Home | Open Home as bus passenger | Alerts, nearby buses and routes shown; no trains | Not run |
| F16 | Home | Tap bookmark on a popular route | Route appears under Saved routes | Not run |
| F17 | Home | Close and reopen the app | Saved route is still there | Not run |
| F18 | Home | Tap bookmark on a saved route | Route is removed from Saved routes | Not run |

| F19 | Search | Type "col" in From | Suggestions show Colombo (bus) or Colombo Fort (train) only | Logic passes (npm test); screen not run |
| F20 | Search | Tap a suggestion | Box fills with that place | Not run |
| F21 | Search | Tap Search with empty From and To | Error under each box, no navigation | Not run |
| F22 | Search | Same place in From and To | "Choose a different place", no navigation | Not run |
| F23 | Search | Valid search | Results screen opens with the two places; search saved under Recent searches | Not run |
| F24 | Search | Tap the swap button | From and To exchange | Not run |
| F25 | Search | Tap a recent search | Results opens for that pair | Not run |
| F26 | Search | Tap X on a recent search, then Clear all | Item removed; list empties | Not run |
| F27 | Search | Search as bus, change to train | Recent searches show only train searches | Not run |
| F28 | Search | Close and reopen the app | Recent searches are still there | Not run |
| F29 | Results | Search Colombo to Kandy as bus | Route 1 trips listed, earliest first, with times, duration, fare and status | Logic passes (npm test); screen not run |
| F30 | Results | Search Kandy to Colombo (reverse) | Same Route 1 trips are listed | Logic passes (npm test); screen not run |
| F31 | Results | Search a pair with no route | "No buses found" with a Change search button | Logic passes (npm test); screen not run |
| F32 | Results | Open Filter & sort, choose Cheapest | List reorders; header says "Sorted by cheapest" | Logic passes (npm test); screen not run |
| F33 | Results | Choose Shortest trip | Trips ordered by travel time | Logic passes (npm test); screen not run |
| F34 | Results | Turn on "On time only" | Delayed trips disappear; filter badge shows 1; count updates | Logic passes (npm test); screen not run |
| F35 | Results | Choose Evening and Night | Only trips leaving 5 pm to 5 am remain | Logic passes (npm test); screen not run |
| F36 | Results | Apply filters that match nothing | "Nothing matches your filters" with Clear filters | Logic passes (npm test); screen not run |
| F37 | Filter | Tap Reset | Sort and filters return to defaults | Logic passes (npm test); screen not run |
| F38 | Results | Start a new search after filtering | Filters are reset | Not run |
| F39 | Results | Search as train, then as bus | Each shows only its own transport | Logic passes (npm test); screen not run |

| F40 | UI | Open the app | Landing screen is navy with the RideTrack logo and three role buttons | Not run |
| F41 | UI | Open Select Transport | Bus is preselected with a tick; tapping Train moves the tick; Continue opens Home for the selected type | Not run |
| F42 | UI | Open Home | Navy header with a time-based greeting and the search card; alerts, nearby vehicles and routes below | Not run |
| F43 | UI | Tap Train in the Bus/Train toggle on Home | Home content and suggestions switch to trains | Not run |
| F44 | Search | Tap Travel date | Date picker opens; past dates cannot be chosen; chosen date shows in the field | Not run |
| F45 | Search | Choose Morning, then search | Results opens with only morning trips (Morning filter on) | Not run |
| F46 | Results | Open Results | Header shows Available Transport, From to To and the travel date; cards show name, ON TIME or DELAYED pill, times with duration, fare | Not run |
| F47 | Filter | Choose Up to Rs. 500 | Only trips on routes costing Rs. 500 or less remain; badge counts it | Logic passes (npm test); screen not run |
| F48 | Filter | Choose Under 2 hours, then Over 4 hours | Only trips in that duration band remain; tapping the same chip again clears it | Logic passes (npm test); screen not run |
| F49 | UI | Check every tab bar | Dark navy bar with white active tab and muted inactive tabs, for all three roles | Not run |
| F50 | UI | Check every screen header | Back button on Results, Filter & Sort and Select Transport (when there is history); status bar text readable | Not run |
| F51 | Results | Tap a result card | Transport Details opens for that trip | Not run |
| F52 | Results | Look at a result card | Facility chips (AC, Wi-Fi, USB) and the seat count are visible | Not run |
| F53 | Details | Open Transport Details | Vehicle name, ON TIME or DELAYED pill, route, date, times with duration, fare, seats, facilities and the stop list | Not run |
| F54 | Details | Tap View full route | Route & Stops opens for the same trip | Not run |
| F55 | Details | Tap the bookmark in the header | Route is saved and shows under Saved routes on Home; tapping again removes it | Not run |
| F56 | Details | Tap Track Vehicle | Live Tracking starter screen opens with a back button | Not run |
| F57 | Details | Look at Book Ticket | Button is disabled with a note | Not run |
| F58 | Route | Open Route & Stops before the trip departs | All stops are Upcoming; location card says it has not departed and when it leaves | Logic passes (npm test); screen not run |
| F59 | Route | Open Route & Stops during the trip | Passed stops are Departed (filled dots), later ones Upcoming; card says between two stops with minutes to the next | Logic passes (npm test); screen not run |
| F60 | Route | Open Route & Stops after the trip ends | All stops are Arrived; card says Journey completed | Logic passes (npm test); screen not run |
| F61 | Details | Open a trip that does not exist | "We could not find this trip" message with a back button | Logic passes (npm test); screen not run |
| F62 | Tracking | Tap Track Vehicle on Transport Details | Live Tracking opens with a map showing the route line and a marker at every stop | Not run |
| F63 | Tracking | Open Live Tracking | Map fits the whole route; header shows vehicle, route and a pulsing LIVE pill | Not run |
| F64 | Tracking | Look at the panel | Vehicle number, ON TIME or DELAYED pill, Updated Ns ago (counts up, resets every 5 seconds), location, ETA and arrival tiles | Not run |
| F65 | Tracking | Tap Simulate trip | Vehicle marker moves along the route for about 90 seconds; travelled part turns blue; location and ETA tiles update; the button reads Stop demo | Not run |
| F66 | Tracking | Tap Stop demo | Movement stops and the position returns to the timetable position | Not run |
| F67 | Tracking | Use zoom in, zoom out | Map zooms in and out | Not run |
| F68 | Tracking | Pan away, then tap Centre on vehicle | Map returns to the vehicle | Not run |
| F69 | Tracking | Pan away, then tap Show whole route | Map shows every stop again | Not run |
| F70 | Tracking | Tap a stop marker | Stop name and its arrival time are shown | Not run |
| F71 | Tracking | Open it before the trip departs | Panel says it has not departed; vehicle sits at the first stop; ETA reads Not started | Logic passes (npm test); screen not run |
| F72 | Tracking | Tap Route & Stops | Route & Stops opens for the same trip, and back returns to the map | Not run |
| F73 | Home | Open the app with no Firebase keys in `.env` | Home shows sample data; label says Sample data and asks for the keys | Not run |
| F74 | Home | Keys and test password set; tap Continue as Passenger | Signs in as the test passenger; Home shows a green Live data label | Not run |
| F75 | Home | Compare Home as bus with the Firebase console | Vehicles, published routes and alerts match the seeded documents, for buses and the all-transport alerts only | Not run |
| F76 | Home | Switch to Train in the search card toggle | Home shows train vehicles, routes and alerts only | Not run |
| F77 | Home | Change a vehicle's `etaMinutes` or `status` in the console while Home is open | Home updates within a few seconds without a refresh | Not run |
| F78 | Home | Add an alert in the console while Home is open | New alert appears at the top without a refresh | Not run |
| F79 | Home | Wrong or missing test password | First screen says test sign-in failed; Home shows sample data labelled Sample data | Not run |
| F80 | Home | Turn the phone's internet off, then open Home | Within about 8 seconds Home shows sample data with a slow-connection note | Not run |
| F81 | Home | Bookmark a live route, restart the app | The route is still under Saved routes | Not run |
| F82 | Security | Sign out, or open Home with no user | Sample data with the sign-in note; Firestore reads are denied | Not run |
| F83 | Search | Keys and test sign-in set; type "kan" in Destination as bus | Suggestions come from the Firestore routes and show Kandy | Not run |
| F84 | Search | Open the app with no keys; type "col" | Suggestions still appear, from sample data | Not run |
| F85 | Results | Live data on; search Colombo to Kandy as bus | Trips come from Firestore: times from the schedule's departure and arrival, vehicle NB-4521, status matches the vehicle | Not run |
| F86 | Results | With Results open, set a vehicle's `status` to `delayed` in the console | The trip's pill changes to DELAYED within a few seconds without a refresh | Not run |
| F87 | Results | Open Results on a slow connection | A spinner shows first, then the list (sample trips after about 8 seconds if Firestore never answers) | Not run |
| F88 | Details | Open a live result | Fare, vehicle, facilities and the stop list come from Firestore; Route 1 shows 6 stops | Not run |
| F89 | Route | Open Route & Stops for a live trip | 6 stops in order with times between the departure and arrival times | Not run |
| F90 | Details | Open a trip id that is not in Firestore while live data is on | "We could not find this trip" message, not a sample trip | Not run |
| F91 | Tracking | `npm run simulate` running in the backend; open Live Tracking | Marker moves along the route about every 3 seconds; footer says "Live GPS position reported by the vehicle"; Updated Ns ago resets on each move | Not run |
| F92 | Tracking | Stop the simulator and wait 2 minutes | Footer changes to the timetable message and the marker follows the timetable | Not run |
| F93 | Tracking | Start the simulator again | Marker returns to live GPS within about 5 seconds, without reopening the screen | Not run |
| F94 | Tracking | Tap Simulate trip while live GPS is on | The 90-second demo takes over; Stop demo returns to the GPS position | Not run |
| F95 | Home | With the simulator running, watch the vehicle list on Home | Next stop and ETA of each vehicle change as the vehicles move, without a refresh | Not run |

## Automated checks

`npm test` runs 34 checks (Node's built-in test runner with `tsx`) in `tests/`. They cover the logic behind the Search, Results, Details, Route & Stops and Live Tracking screens, using the sample data: place suggestions, trips between two places (both directions, per transport), the Filter & Sort rules, trip progress by time of day, and mapping a GPS point onto a route. They also cover the functions that join live Firestore data. They do **not** open any screen, so a case they cover shows **Logic passes (npm test); screen not run** until someone runs it on the phone. Case ids are in the test names.

| File | Cases covered |
|---|---|
| `tests/search-data.test.ts` | F19, F22 (suggestions), F30, F31, F39, live-data joins |
| `tests/results-filter.test.ts` | F29, F32 to F37, F47, F48, departure windows |
| `tests/trip.test.ts` | F53, F58 to F61, F71, live GPS snapping to the route |

Last run 4 Oct 2026: 34 passed, 0 failed. As a check that the tests can fail, the on-time filter and the reverse-route match were broken on purpose; F34 and F30 failed as they should, then the code was restored.

The backend simulator has its own tests (`npm test` in `ridetrack-backend`, 5 checks on the route maths).

## Integration cases

| ID | Flow | Steps | Expected | Result |
|---|---|---|---|---|
| I1 | QR scan | Passenger books, conductor scans ticket | Valid screen, status `used` | Not run |
| I2 | QR reuse | Scan the same ticket again | Invalid screen | Not run |
| I3 | Incident | Conductor reports, authority opens Incident Mgmt | Incident appears without refresh | Not run |
| I4 | Alert | Authority creates alert | Passenger Notifications updates live | Not run |

## Traceability

Every test case must name the requirement it checks (add an `Req` column value such as FR3 when you finalise cases). The full matrix is in [TRACEABILITY.md](../project/TRACEABILITY.md). Functional cases must cover all core features and the CRUD operations of every screen.

## Requirement coverage (Silva's area)

Draft mapping of each case to a requirement; confirm the wording against the requirements document (see [TRACEABILITY.md](../project/TRACEABILITY.md)).

| Requirement | Cases |
|---|---|
| FR3 Search, Results, Filter & Sort (also Select Transport and Home, the entry points) | F1, F2, F11 to F50, F52, F73 to F84, F87 |
| FR4 Transport Details, Route & Stops | F51, F53 to F61, F85, F88 to F90 |
| FR7 Live Tracking | F3, F56, F62 to F72, F91 to F95 |

## Usability testing

Plan, participants (minimum 5), tasks and results are in [USABILITY-TESTING.md](USABILITY-TESTING.md). Compare with the earlier prototype test results to show improvement.

## Bug log

| ID | Description | Severity | Owner | Status |
|---|---|---|---|---|
| | | | | |
