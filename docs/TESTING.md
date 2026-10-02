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

## Integration cases

| ID | Flow | Steps | Expected | Result |
|---|---|---|---|---|
| I1 | QR scan | Passenger books, conductor scans ticket | Valid screen, status `used` | Not run |
| I2 | QR reuse | Scan the same ticket again | Invalid screen | Not run |
| I3 | Incident | Conductor reports, authority opens Incident Mgmt | Incident appears without refresh | Not run |
| I4 | Alert | Authority creates alert | Passenger Notifications updates live | Not run |

## Traceability

Every test case must name the requirement it checks (add an `Req` column value such as FR3 when you finalise cases). The full matrix is in [TRACEABILITY.md](TRACEABILITY.md). Functional cases must cover all core features and the CRUD operations of every screen.

## Usability testing

Plan, participants (minimum 5), tasks and results are in [USABILITY-TESTING.md](USABILITY-TESTING.md). Compare with the earlier prototype test results to show improvement.

## Bug log

| ID | Description | Severity | Owner | Status |
|---|---|---|---|---|
| | | | | |
