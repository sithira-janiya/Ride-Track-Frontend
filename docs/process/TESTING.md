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

| F19 | Search | Type "col" in From | Suggestions show Colombo (bus) or Colombo Fort (train) only | Not run |
| F20 | Search | Tap a suggestion | Box fills with that place | Not run |
| F21 | Search | Tap Search with empty From and To | Error under each box, no navigation | Not run |
| F22 | Search | Same place in From and To | "Choose a different place", no navigation | Not run |
| F23 | Search | Valid search | Results screen opens with the two places; search saved under Recent searches | Not run |
| F24 | Search | Tap the swap button | From and To exchange | Not run |
| F25 | Search | Tap a recent search | Results opens for that pair | Not run |
| F26 | Search | Tap X on a recent search, then Clear all | Item removed; list empties | Not run |
| F27 | Search | Search as bus, change to train | Recent searches show only train searches | Not run |
| F28 | Search | Close and reopen the app | Recent searches are still there | Not run |

## Integration cases

| ID | Flow | Steps | Expected | Result |
|---|---|---|---|---|
| I1 | QR scan | Passenger books, conductor scans ticket | Valid screen, status `used` | Not run |
| I2 | QR reuse | Scan the same ticket again | Invalid screen | Not run |
| I3 | Incident | Conductor reports, authority opens Incident Mgmt | Incident appears without refresh | Not run |
| I4 | Alert | Authority creates alert | Passenger Notifications updates live | Not run |

## Traceability

Every test case must name the requirement it checks (add an `Req` column value such as FR3 when you finalise cases). The full matrix is in [TRACEABILITY.md](../project/TRACEABILITY.md). Functional cases must cover all core features and the CRUD operations of every screen.

## Usability testing

Plan, participants (minimum 5), tasks and results are in [USABILITY-TESTING.md](USABILITY-TESTING.md). Compare with the earlier prototype test results to show improvement.

## Bug log

| ID | Description | Severity | Owner | Status |
|---|---|---|---|---|
| | | | | |
