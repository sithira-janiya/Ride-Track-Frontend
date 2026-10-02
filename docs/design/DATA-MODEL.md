# Data Model

Firestore (NoSQL). Ids are document ids unless stated. Timestamps use Firestore `Timestamp`.

## Collections

### `users/{uid}`
| Field | Type | Notes |
|---|---|---|
| name | string | |
| email | string | |
| phone | string | optional |
| role | `passenger` \| `conductor` \| `authority` | drives routing and rules |
| createdAt | timestamp | |

### `vehicles/{id}`
| Field | Type | Notes |
|---|---|---|
| type | `bus` \| `train` | |
| number | string | plate or train number |
| capacity | number | |
| status | `active` \| `delayed` \| `offline` | |
| routeId | string | current route |
| location | `{lat, lng, updatedAt}` | live position |
| facilities | string[] | AC, Wi-Fi, etc. |

### `routes/{id}`
| Field | Type | Notes |
|---|---|---|
| name | string | e.g. Colombo to Kandy |
| type | `bus` \| `train` | |
| stops | `{name, lat, lng, order}`[] | |
| fare | number | LKR |
| published | boolean | set by Preview & Publish |

### `schedules/{id}`
| Field | Type |
|---|---|
| type | `bus` \| `train` (copied from the route, so passengers can filter by it) |
| routeId | string |
| vehicleId | string |
| conductorId | string |
| departure | timestamp |
| arrival | timestamp |

### `bookings/{id}`
| Field | Type | Notes |
|---|---|---|
| userId | string | |
| scheduleId | string | |
| passengers | `{name, age}`[] | |
| total | number | |
| status | `confirmed` \| `used` \| `cancelled` | |
| paymentRef | string | simulated |
| createdAt | timestamp | QR encodes the booking id |

### `incidents/{id}`
| Field | Type | Notes |
|---|---|---|
| conductorId | string | |
| vehicleId | string | |
| type | `delay` \| `breakdown` \| `safety` \| `other` | |
| description | string | |
| status | `open` \| `reviewed` \| `resolved` | set by authority |
| createdAt | timestamp | |

### `alerts/{id}`
| Field | Type |
|---|---|
| title | string |
| message | string |
| routeId | string, optional (null means all routes) |
| createdBy | string (authority uid) |
| createdAt | timestamp |

## Passenger queries by transport type

`routes`, `vehicles` and `schedules` all carry `type`. Passenger queries filter on the type chosen at the start, for example `where('type', '==', 'bus')`. Firestore may ask for a composite index when combining this filter with sorting; create it from the link in the error message.

## Relationships

```
users ─┬─< bookings >── schedules ──┬── routes
       │                            └── vehicles
       ├─< incidents >── vehicles
       └─< alerts (created by authority)
```

## CRUD by collection (supports the "2 CRUD per screen" rule)

| Collection | Create | Read | Update | Delete |
|---|---|---|---|---|
| users | register | Profile | edit Profile | |
| vehicles | Add Vehicle | Vehicle Mgmt | edit status | remove vehicle |
| routes / schedules | Routes, Schedule | Search, Results | edit, publish | remove |
| bookings | Payment | My Tickets | scan marks used | Cancel Booking |
| incidents | Report Incident | Incident Mgmt | Review Incident | |
| alerts | Create Alert | Notifications | | withdraw alert |

## Security rules (outline)

- Passenger: read published routes, schedules, vehicles and alerts; read and write only own bookings.
- Conductor: read bookings for assigned schedules and update status to `used`; create incidents; update own vehicle location.
- Authority: full read and write on vehicles, routes, schedules, alerts and incidents.
- Users cannot change their own `role`.
