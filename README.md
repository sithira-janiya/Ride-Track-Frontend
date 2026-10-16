# RideTrack Frontend

Mobile app for RideTrack, a public transport (bus and train) tracking and ticketing system for Sri Lanka: SLTB buses, private buses running on NTC route permits, and Sri Lanka Railways, in one app. It is set up as a demo for the Ministry of Transport. One React Native app serves three kinds of user; the screens shown depend on the logged-in user's role: **Passenger**, **Staff** (conductor/inspector) and **Authority** (Ministry / NTC officer).

The app also has a Dubai region (real RTA data). It is hidden unless a build turns it on with `EXPO_PUBLIC_REGIONS=SRI_LANKA,DUBAI` (see Regions under [Features built so far](#features-built-so-far)).

**Want to try it?** Log in with the [demo accounts for the 3 roles](#demo-logins-for-the-3-roles) on the live web demo at https://ride-track-frontend-src.vercel.app (password `Password1!`).

> This file is kept up to date as the app is built. See [Keeping this README current](#keeping-this-readme-current).

## Demo logins for the 3 roles

Every demo account uses the password **`Password1!`**. The role decides which app you get: the bottom tab bar, the colours and the screens are different for each role.

### Where to try it

| Where | How | Data |
|---|---|---|
| Live web demo | Open **https://ride-track-frontend-src.vercel.app** in any browser (a phone browser works too) | Built-in mock data, nothing to install. The live site is built from the `main` branch, so features that are only on other branches may be missing there. |
| Your computer, web | `npm start`, then press `w` (opens http://localhost:8081) | Mock data by default (`EXPO_PUBLIC_USE_MOCK_API=true`) |
| Your phone, Expo Go | `npm start`, then scan the QR code with Expo Go (phone and computer on the same Wi-Fi) | Same as above; the camera scanner and live map only work here |
| Real backend | Set `EXPO_PUBLIC_USE_MOCK_API=false` (see [Running against the real backend](#running-against-the-real-backend-ridetrack-api)) | RideTrack-API's seeded accounts (see [Mock and real backend accounts](#mock-and-real-backend-accounts)) |

### The accounts

| Role | Log in with | Password | Who you are (mock data) | Tabs you get |
|---|---|---|---|---|
| **Passenger** | `passenger@ridetrack.test` | `Password1!` | Nimal Perera | Home · Tickets · Alerts · Profile |
| Passenger (mobile number) | `0771234567` | `Password1!` | Kavitha Rajendran | Home · Tickets · Alerts · Profile |
| **Staff**: conductor | `staff@ridetrack.test` | `Password1!` | Sunil Fernando, conductor C-1001, SLTB Maharagama Depot, bus NB-1234 on route 138 | Scan · Passengers · Shift |
| Staff: inspector | `inspector@ridetrack.test` | `Password1!` | Ruwan Bandara, inspector I-1001, SLTB Maharagama Depot (no bus assigned) | Scan · Passengers · Shift |
| **Authority** | `officer@ridetrack.test` | `Password1!` | Dilani Jayasinghe, National Transport Commission | Home (dashboard) · Fleet · Reports · Alerts · Admin |

Type the login exactly as shown, in lower case. The mobile-number passenger and the inspector exist in mock mode only.

**Logging out** works the same for every role. Each role's home screen (passenger **Home**, staff **Scan**, authority **Home** and the **Admin** overview) starts with your name and a **Log out** button. It is also at the bottom of **Profile** (passenger), **Shift** (staff) and **Home** (authority). The app asks before logging you out; staff are told their shift will end.

### Passenger: what to try

The passenger app is for people who ride: find a route, see when the next bus or train comes, buy a ticket and show its QR code.

1. Log in as `passenger@ridetrack.test`. Home greets Nimal and opens with "Where to?".
2. Type `138` in **Search routes** and open route **138** (Pettah - Kottawa). You see every stop with its fare from the start; tap a stop for its next arrivals. **Save** adds the route to Favourite routes on Home. **Track live on map** works in Expo Go (the web shows a notice instead of the map).
3. Tap **Buy a ticket**, then:
   1. *Where do you board?* **Pettah (Central Bus Stand)**
   2. *Where do you get off?* **Nugegoda** (Rs. 55)
   3. *Which trip?* pick any time, then tap **Pay Rs. 55**.

   In mock mode the payment goes through straight away and the ticket opens with its QR code and **Ticket number 100**. Tickets bought after that get 101, 102 and so on; the numbering starts again at 100 when the page reloads.
4. **Tickets**: filter Active, Used, Cancelled or All. Open a ticket to see its QR code (screen brightness goes up on a phone) or to cancel it.
5. **Alerts**: two unread alerts are waiting (route 138 running late, Main Line trains skipping Maradana); the number on the tab shows how many are unread.
6. **Profile**: change your name (**Save changes**), pick English, සිංහල or தமிழ் (needs the Google Translate key, see [Languages](#languages-google-translate)), and log out.

Registering a new account on the login screen always creates a passenger.

### Staff: what to try

The staff app is for conductors and inspectors on board: check tickets and keep the passenger count up to date.

1. Log in as `staff@ridetrack.test`. The **Scan** tab says "No shift started".
2. **Shift**: pick a route, then a trip that has a vehicle. The card now says "On shift".
3. **Scan**: on a phone, point the camera at a passenger's QR code. In a browser (or if a code will not scan), tap **Type ticket number instead**, enter the number and tap **Check ticket**:
   - a paid, unused ticket: **✓ VALID**, "Ticket accepted. Let the passenger board."
   - the same ticket again: **✕ INVALID**, "This ticket has already been scanned."
   - a number that does not exist: **✕ INVALID**, "Ticket not found. This is not a RideTrack ticket."

   Tap **Scan next ticket** to carry on.
4. **Passengers**: update how many people are on board your vehicle; the occupancy bar and the officers' dashboard follow it.
5. Tap **Log out** at the top of **Scan** (or at the bottom of **Shift**). The app asks first and says your shift will end.

### Authority: what to try

The authority app is for Ministry and NTC officers: watch the whole network, publish service alerts, run reports and manage the system.

1. Log in as `officer@ridetrack.test`. **Home** is the live dashboard: vehicles running, active delays, passengers on board and how full the seats are, then every vehicle with its route, arrival time and how full it is. Filter the vehicles by operator (SLTB, Private, Sri Lanka Railways).
2. **Fleet**: every vehicle on one map (in Expo Go), with a filter by route.
3. **Reports**: pick a report type (**Route performance**, **Delays** or **Occupancy**), all routes or one, and **Last 7 days** or **Last 30 days**, then tap **Generate report**.
4. **Alerts**: choose a route and a trip, an alert type (**Delay**, **Cancellation** or **Route change**), write the **Message to passengers** (and the delay in minutes if you like), then tap **Publish alert**. In mock mode it appears in the passenger's Alerts tab in the same session.
5. **Admin** (the back office):
   - **Accounts**: find anyone, add a staff member or officer with their own first password, disable an account.
   - **Vehicles**: add buses and trains, change capacity or route, take one out of service.
   - **Routes**, **Trips** and **Tickets**: every route with its stops, the timetable for any day, and every ticket sold with its payment status.

### A full journey across the 3 roles (about 5 minutes)

Do this in **one browser tab without reloading**: in mock mode the demo data lives in memory, so a reload starts it fresh.

1. **Passenger** (`passenger@ridetrack.test`): buy a route 138 ticket from Pettah to Nugegoda. Note the ticket number (100 on a fresh page). Tap **Log out** at the top of **Home** and confirm.
2. **Staff** (`staff@ridetrack.test`): **Scan** → **Type ticket number instead** → `100` → **✓ VALID**. Check it again to see it rejected as already scanned. **Log out** (top of **Scan**).
3. **Authority** (`officer@ridetrack.test`): **Alerts** → publish a delay on route 138; **Admin** → **Tickets** lists the ticket you bought. **Log out** (top of **Home**).
4. **Passenger** again: **Tickets** → **Used** now shows the scanned ticket, and **Alerts** shows the officer's alert.

### Mock and real backend accounts

| | Mock mode (the default, and the live demo) | Real backend (`npm run seed` in RideTrack-API) |
|---|---|---|
| Password | `Password1!` | `Password1!` |
| Passenger | `passenger@ridetrack.test` (Nimal Perera), `0771234567` (Kavitha Rajendran) | `passenger@ridetrack.test` (Demo Passenger) |
| Staff | `staff@ridetrack.test` (Sunil Fernando, conductor), `inspector@ridetrack.test` (Ruwan Bandara) | `staff@ridetrack.test` (Demo Conductor, ST-001, Demo Transport Co., vehicle 101) |
| Authority | `officer@ridetrack.test` (Dilani Jayasinghe) | `officer@ridetrack.test` (Demo Officer, Transport Authority, AU-001) |
| Defined in | `src/api/mock.ts` (`users`, `MOCK_PASSWORD`) | `scripts/seed.js` in RideTrack-API |

- Outside production the backend seed also creates `admin@ridetrack.test` with the `ADMIN` role. The app has no admin-only screens: use `officer@ridetrack.test`, whose **Admin** tab is the back office.
- The same list is in `.env.example` for quick reference; the app does not read it from there.
- These are demo passwords. Never seed them into a real deployment.

### Login rules

- The login field takes an email or a mobile number. Only the mobile-number passenger has a phone number; log in to the others with the email.
- A wrong email or password gives one message, "Invalid email/phone or password.", so it does not reveal which accounts exist. A disabled account gets the same message.
- Registering needs a password of at least 8 characters with a letter and a number, and always creates a **Passenger**. Staff and officer accounts are created by an officer in **Admin** → **Accounts**, each with its own first password.
- In mock mode, registered and admin-created accounts live in memory and disappear when the page reloads. On the real backend they are saved in MySQL.
- The session is kept on the device (secure storage), so reopening the app goes straight back to your role's home screen until you log out.
- Logging out clears everything that belongs to the account from the device: the saved session, the ticket cache and any payment still being checked, a staff shift, the alert banner, and cached tickets, alerts, profile, dashboards and admin lists. Public routes and timetables stay cached for offline use. The next person who logs in on the same device starts clean.

### If a login does not work

| What you see | Why, and what to do |
|---|---|
| "Invalid email/phone or password." | Check the login is typed exactly as in the table, in lower case, and the password is `Password1!` (capital P, ending in `1!`). |
| "Cannot reach RideTrack" | The app is set to the real backend (`EXPO_PUBLIC_USE_MOCK_API=false`) and cannot reach it. Start RideTrack-API, or check the IP in `.env`, or switch back to mock mode; then restart with `npx expo start -c`. |
| The staff scan says "Ticket not found" for a ticket you just bought | The page was reloaded between buying and scanning, which resets the mock data. Buy the ticket again and scan it in the same tab. |
| The phone number or the inspector is rejected | They exist in mock mode only, not on the real backend. |
| You land on the wrong app | You are still logged in as someone else: the name at the top of the home screen says who. Tap **Log out** there and log in again. |

## Tech stack

| Concern | Choice |
|---|---|
| Framework | React Native + Expo SDK 57 (managed workflow), TypeScript |
| Navigation | Expo Router (file-based, routes in `src/app/`) |
| Server state | TanStack Query |
| Client state | Zustand (auth, favourites, ticket cache, language) |
| Translation | Google Cloud Translation API (v2, Basic) over `fetch` |
| HTTP / real-time | Axios, socket.io-client |
| Maps | react-native-maps (native only; web shows a notice) |
| Tickets / scanning | react-native-qrcode-svg, expo-brightness, expo-web-browser, expo-camera, expo-haptics |
| Alerts | expo-notifications (push registration), socket `alert:new` |
| Storage | expo-secure-store (tokens), AsyncStorage (favourites, ticket cache, offline route cache, language and translations) |
| Forms | React Hook Form |

## Getting started

```bash
npm install
cp .env.example .env.local   # then edit if needed
npx expo start               # scan the QR code with Expo Go, or press w for web
```

For the live map on Android, set `GOOGLE_MAPS_API_KEY` in `.env` (a Google Maps key with **Maps SDK for Android** enabled, restricted to `com.ridetrack.app` and your SHA-1). `app.config.ts` passes it to the react-native-maps plugin at build time, so run `npx expo prebuild -p android --clean` and rebuild after setting it. iOS uses Apple Maps and needs no key.

To show the app in Sinhala or Tamil, set `EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY` in `.env.local` (see [Languages](#languages-google-translate)). Without it the app stays in English.

`EXPO_PUBLIC_REGIONS` picks the regions the app shows: `SRI_LANKA` (the default when it is empty or unset), `DUBAI`, or both, comma-separated. With one region, the region pickers and labels are hidden.

By default the app runs against a **built-in mock API** (`EXPO_PUBLIC_USE_MOCK_API=true`), so no backend is needed. Set it to `false` and point `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_SOCKET_URL` at the real backend to use live data.

### Running against the real backend (RideTrack-API)

The backend lives in the `RideTrack-API` repo (Node, Express, MySQL, Socket.IO). Most endpoints the app calls have been checked against it: login, routes, arrivals, nearby stops, buying and paying for a ticket (mock gateway), staff scan, alerts, the ops dashboard, reports and the admin panel (see [Known limitations](#known-limitations) for the rest).

1. In `RideTrack-API`: start MySQL, then run `npm run migrate`, `npm run seed` and `npm run dev` (see its README). Check `http://<host>:3000/health` returns `{"status":"ok"}`.
2. In this app's `.env.local`, set `EXPO_PUBLIC_USE_MOCK_API=false` and point both URLs at the computer running the API:
   - web or iOS simulator: `http://localhost:3000/api/v1` and `http://localhost:3000`
   - a phone on the same Wi-Fi: the computer's LAN IP (`ipconfig` on Windows), e.g. `http://10.116.186.92:3000/api/v1`
3. Restart with `npx expo start -c`, because `EXPO_PUBLIC_*` values are built in at bundle time.

Notes:
- The LAN IP changes when you switch networks. If the app shows "Cannot reach RideTrack", update the IP here **and** `PUBLIC_URL` in the backend's `.env` (it is used for payment page links).
- Live vehicles only appear while something sends GPS positions: run `npm run simulate` in `RideTrack-API`. Without it, arrivals show timetable times.
- The real backend's seed still has only the three original Colombo routes for Sri Lanka (138, Main Line, 177, with the old stops), not the eight-route network in mock mode, and it does not send `operators`, `operator` or `minFare`, so the operator labels, operator filter and minimum fare do not show against it yet.
- `npm run seed` loads both regions. The app asks the server for Sri Lankan routes only (and hides Dubai vehicles and admin routes) unless `EXPO_PUBLIC_REGIONS` includes `DUBAI`. On a database seeded before the Dubai data existed, run `npm run migrate` and then `npm run seed` again: it adds Dubai and keeps the Sri Lanka data.
- Passengers only receive an alert when they hold a pending or active ticket for that trip.
- The EAS `preview` profile forces mock mode; `development` and `production` use the real API. `preview` stays on mock because it is a release build, and Android blocks plain `http://` in release builds, so it cannot reach the API until the API has an HTTPS address.

### Demo accounts

The logins for every role, what each one can do and a step-by-step tour are in [Demo logins for the 3 roles](#demo-logins-for-the-3-roles).

### Useful commands

```bash
npx tsc --noEmit    # typecheck
npx expo lint       # lint
npx expo-doctor     # check dependencies and config
npm test            # run the automated tests (Jest)
```

Run typecheck and lint before committing. Add packages with `npx expo install <package>`, not `npm install`, so versions match the SDK.

## Project status

Phases follow [`docs/11-frontend-tasks.md`](../RideTrack%20Development/docs/11-frontend-tasks.md) in the RideTrack Development repo.

| Phase | Scope | Status |
|---|---|---|
| 0 | Setup: theme, shared UI, API client, mock API | Done |
| 1 | Auth: login, register, session restore, role-based routing | Done |
| 2 | Passenger: route search, nearby stops, route detail, arrivals, favourites | Done |
| 3 | Passenger: live map with real-time vehicles | Done (not yet tested on a device; no marker animation) |
| 4 | Passenger: buy ticket, payment, ticket list, QR, cancel, offline cache | Built, untested on a device; real payment gateway not exercised |
| 5 | Staff: QR scanner, scan result, manual entry, passenger count, shift | Built; manual entry, shift and count checked in the browser; camera scan and haptics not tested on a device |
| 6 | Passenger: alerts, push registration, profile settings | Built; alerts list, unread badge, banner, and profile save checked in the browser; real push and socket alerts not tested |
| 7 | Authority: dashboard, live fleet, reports, alerts | Built; dashboard, fleet filter, reports and publishing an alert checked in the browser; map and real-time updates not tested on a device |
| – | Authority: admin back office (overview, accounts, vehicles, routes, trips, tickets) | Built; every screen checked in the browser against the real backend (create and disable an account, edit a vehicle); not tested on a device |
| – | Regions: Sri Lanka and Dubai (real RTA routes, stops, fare zones and timetables), times on each route's local clock, fares in LKR or AED | Built; checked in the browser in mock mode (route search by region, Red Line stops, zone fares, Dubai-time arrivals, buying an AED ticket, officer dashboard and trips); the API side is covered by RideTrack-API's tests and a simulator run; not tested on a device or the map |
| – | Sri Lanka focus for a Ministry of Transport demo: eight real Sri Lankan routes (SLTB and private buses 138, 177, 100, 187, 1 and 2; Main Line and Coastal Line trains), SLTB / private / railway operator on routes and vehicles with an operator filter for officers, NTC minimum bus fare, Dubai hidden behind `EXPO_PUBLIC_REGIONS` | Built; checked in the browser in mock mode at phone size (sign-in tagline, passenger home without a region picker, bus search, route 138 stops and fares, officer dashboard with the operator filter); unit tests cover the network, the minimum fare, the hidden Dubai data and the setting. Not checked against the real backend (its seed does not have the new routes) or on a device |
| – | Design: Figma design system and screens for every role, applied to the app (grey page with white cards, role-coloured tab bar and screen headers) | Built; checked in the browser at phone size in light and dark mode (sign-in, passenger home and tickets, authority dashboard and reports, admin overview); not tested on a device |
| – | Loading animation: a looping street scene (RideTrack bus, tuk-tuk, car, train, Colombo skyline) on app start, on the web while the bundle downloads, and in every in-screen loading state | Built; checked in the browser at phone size in light and dark mode, with reduced motion, and through the hand-off from the web boot screen to the app (logged out and logged in); not tested on a device |
| – | Log out for every role: account bar with name and Log out on every role's home screen, confirmation, and clearing all account data from the device | Built; checked in the browser at phone size in light and dark mode for passenger, staff (with a shift running) and officer, including cancelling, and a reload after logging out stays on the login screen; unit tests cover the store and the button; not tested on a device |
| 8 | Quality and release | In progress: contrast audit, automated tests and build config done; device, offline and usability testing and the real build still to do |

## Features built so far

**Sri Lanka network (demo mode)**
- Eight real routes, with their stops in the real order (`src/api/mock-sri-lanka.ts`):
  - Buses (SLTB and private, by NTC route number): **138** Pettah – Kottawa (via Town Hall, Thummulla, Kirulapone, Nugegoda, Maharagama), **177** Kollupitiya – Kaduwela (via Borella, Rajagiriya, Battaramulla, Malabe), **100** Pettah – Panadura (Galle Road), **187** Pettah – Katunayake Airport, **1** Colombo – Kandy, **2** Colombo – Matara.
  - Trains (Sri Lanka Railways): **Main Line** Colombo Fort – Kandy (via Ragama, Gampaha, Polgahawela, Kadugannawa, Peradeniya) and **Coastal Line** Colombo Fort – Matara (via Mount Lavinia, Panadura, Kalutara, Galle).
- 18 vehicles run in demo mode: 6 SLTB buses, 8 private buses and 4 trains, with Sri Lankan registration numbers.
- Who runs what: each route lists its operators ("SLTB · Private", "Sri Lanka Railways") on its card, and each vehicle its operator on the officer dashboard, live fleet and admin vehicles list. The dashboard and fleet map have an Operator filter (All, SLTB, Private, Sri Lanka Railways) and a "Live now: SLTB 6 · Private 8 · Sri Lanka Railways 4" count, so an officer sees state and private buses side by side. These only show when the server sends `operators` / `operator`.
- Bus fares never go below the NTC minimum fare (Rs. 27, unchanged by the July 2025 revision). The route page says "Shorter trips pay the minimum fare of Rs. 27." The fare rule (`src/utils/fare.ts`) uses a route's `minFare` when it has one.
- The sign-in screens say "SLTB, private buses and Sri Lanka Railways in one app." in a Sri Lanka-only build.
- Demo accounts have Sri Lankan names (see Demo accounts).

**Regions (Sri Lanka and Dubai)**
- `EXPO_PUBLIC_REGIONS` decides which regions a build shows (`src/config/env.ts`, `src/config/regions.ts`). The default is Sri Lanka only: the passenger "Where" picker, the officer's region filters and the region labels on routes, shifts and admin routes are hidden, route searches ask the server for Sri Lankan routes only, and in mock mode the Dubai routes, stops, vehicles and trips are left out entirely. Set `EXPO_PUBLIC_REGIONS=SRI_LANKA,DUBAI` to bring Dubai back as before.
- Every route belongs to a region. Sri Lanka has the network above, with fares in rupees. Dubai has real Dubai RTA data: Metro Red Line (to Expo 2020 and to Life Pharmacy), Metro Green Line, the Dubai Tram and buses C01, 27, 8 and X28, each direction as its own route, with the real stops in order, fare zones, running times between stops and the weekly timetable (from RTA's GTFS feed; see RideTrack-API's README, "Regions and the Dubai data").
- Times are shown on the route's own clock (`Asia/Colombo` or `Asia/Dubai`). When that differs from the phone's, the route page says "Times shown in Dubai time" (or Sri Lanka time), so a Dubai departure is never read as local time.
- Fares are in the route's currency: `Rs. 50` in Sri Lanka, `AED 5` in Dubai. Dubai fares follow RTA's zones (Nol Silver): AED 3 within one zone, AED 5 across two, AED 7.50 for three or more. The app works the fare out with the same rule as the server (`src/utils/fare.ts`), and lists the zone fare from the first stop next to each stop.
- In mock mode the Dubai routes, stops and timetables are the same real data (`src/api/mock-data/dubai-rta.json`, read by `src/api/mock-dubai.ts`); trips, vehicle positions and arrivals are worked out from the timetable as the clock runs.

**Passenger**
- Home opens with a blue welcome card: a greeting for the time of day with the passenger's first name, "Where to?", and an illustration of a commuter at a stop as the bus pulls in. Section headings have emoji (🔎 Results, ⭐ Favourite routes, 📍 Stops near you).
- Search routes (debounced, bus/train filter, and a Sri Lanka/Dubai filter when Dubai is on), nearby stops (asks for location; in Dubai it finds the real metro, tram and bus stops), favourite routes.
- Route detail: ordered stops with fares, upcoming arrivals at a chosen stop.
- Live map: route line, stops and moving vehicles over WebSocket, with arrival time and occupancy (icon and text). Shows "Live / Reconnecting" and an "out of date" warning after 60 s without updates.
- Tickets: pick boarding stop, drop-off stop and trip, see the fare, pay. A pending payment is saved on the device and re-checked when the app resumes, so it is never lost. Ticket list with filters and paging, QR screen with a screen-brightness boost, cancel an unused ticket. Tickets are cached on the device so they still show offline, and cleared on logout.

- Alerts tab: delay, cancellation and route-change alerts with unread highlighting, a tab badge with the unread count, "Mark as read" and "Mark all as read". A banner slides in over any screen when the server sends `alert:new`. The device is registered for push notifications on login (skipped in mock mode, on web, and when notifications are off). In mock mode a "Demo: simulate a new alert" button stands in for the server.
- Profile: edit name, choose language (English, Sinhala, Tamil) and turn alert notifications on or off. Also has Log out (as does the account bar at the top of Home). Saving a new language switches the app to it (see Languages below).

**Staff**
- Scan tab opens with a teal welcome card (greeting, an illustration of a conductor scanning a ticket) and a label with the current shift ("On shift · 138") or "No shift started".
- Scan tab: camera permission flow, QR scanning, then a large VALID / INVALID result with the reason (icon, word and colour) and haptic feedback. "Scan next ticket" resets for the next passenger. If a QR will not scan, type the ticket number instead.
- Passengers tab: set the on-board passenger count for the shift's vehicle (+/- 1 and 5), sent to the server with Save.
- Shift tab: choose route and trip (and so the vehicle) for the shift; remembered on the device until the shift ends or the staff member logs out.
- Log out is at the top of the Scan tab (account bar) and at the bottom of the Shift tab.

**Authority**
- Dashboard: an indigo welcome card (greeting, "Operations", an illustration of the live operations screen) with a "Live · 14:05" label (time of the last update) once data has loaded. Then live tiles, each with an emoji in a tinted bubble (🚌 vehicles live, ⏱️ active delays, 🧍 passengers on board, 👥 nearly-full vehicles), active delays and cancellations, and every vehicle with arrival time, occupancy and operator, filterable by operator (and by region when Dubai is on). Refreshes on the server's `ops:update` event (polls every few seconds in mock mode).
- Fleet tab: when Dubai is on, pick Sri Lanka or Dubai first (so the map is not framed across both); then filter by operator and by route; selecting a card highlights its marker. Route pickers here and on the Alerts, Reports and Trips screens name the direction ("Red to Expo 2020"), since Dubai has four "Red" routes.
- Reports tab: choose report type (route performance, delays, occupancy), route and period (last 7 or 30 days), then see a bar chart and a table.
- Alerts tab: publish a delay, cancellation or route-change alert for a trip, with validation, and review published alerts. In mock mode a published alert also shows up for passengers.
- Admin tab (back office, backed by RideTrack-API `/admin/*`):
  - Overview: a violet welcome card ("Back office", "Admin", an illustration of the account list, gears and a shield), then today's trips, delays and cancellations, tickets sold and revenue (one tile per currency, never rupees and dirhams added together), plus account, vehicle, route and stop counts. Tiles and the Manage rows have emoji icons (🗓️ ⏱️ 🎫 💰 👥 🚫 🚌 🛣️).
  - Accounts: search by name, email or phone, filter by role, page through results. Add a staff (conductor or inspector, optionally on a vehicle) or authority officer account. Disable an account (asks first; the person is signed out at once) or enable it again. You cannot disable your own account.
  - Vehicles: add a bus or train to a route of the same kind, change its capacity or route, take it out of service or return it.
  - Routes: every route, active or not, with its stop and vehicle counts (read only).
  - Trips: yesterday's, today's or tomorrow's timetable (UTC days), filterable by route, with status and tickets sold. Times are in each route's local time, marked "Dubai time" where that differs from the phone.
  - Tickets: every ticket sold, newest first, filterable by status, with passenger, fare and payment status.
  - Admin data is never saved on the device. Opening an admin page directly (web refresh or link) still puts the overview underneath it, so the back arrow works.
- Log out is at the top of the Dashboard and of the Admin overview (account bar), and at the bottom of the Dashboard.

**Offline routes and timetables**: routes, route detail, stop arrivals and nearby stops are saved on the device for 24 hours (`src/app/_layout.tsx`), so they still show without signal. Alerts, tickets and live vehicle positions are not saved here (tickets have their own cache).

**Design (Figma)**: the full design lives in Figma: [RideTrack – App Design](https://www.figma.com/design/jK9BYdggutfaWAjMtCrmTC). It has three pages:
- *Design System*: colour variables that match `src/theme` (`Color · Light` and `Color · Dark`), spacing and radius variables, text styles (Inter stands in for the system font), card and tab-bar shadows, and components that mirror the code: Button, Chip, Status badge, Text field, Section title, Screen header, Card, Stat tile, Nav row, Occupancy bar, Hero pill, Dashboard hero (one per role, with its illustration) and Tab bar (one per role).
- *Screens*: one section per role. Sign in (log in, register), Passenger (home, tickets, ticket QR, alerts, profile), Staff (scan, scan result, passengers, shift), Authority (dashboard, fleet, reports, alerts) and Admin (overview, accounts, vehicles).
- *Cover*: left empty for a title card.

What the design changed in the app:
- Light mode pages are soft grey (`#F4F6FA`) and cards are white with a 1px border and a soft shadow, so cards stand out from the page (`useCardSurface` in `src/hooks/use-colors.ts`, used by `Card`, `NavRow` and `TicketCard`). Text fields and chips are white too. Dark mode keeps its colours and uses the border instead of a shadow.
- Each role has an accent colour (`roleAccent` in `src/theme`: passenger blue, staff teal, authority indigo, admin violet, with lighter versions for dark mode). The bottom tab bar uses it for the active label and a tinted pill behind the active emoji (`useTabBarOptions(tone)`, `TabEmoji`), so each role's app looks different at a glance.
- Every tab screen that is not a role home starts with `ScreenHeader` (`src/components/ui/ScreenHeader.tsx`): the role name in its accent colour, the title, and a one-line subtitle where it helps (My tickets, Alerts and Profile for passengers; Passengers on board and Shift for staff; Live fleet, Reports and Alerts for authority).
- The admin Manage rows use the admin violet. The passenger ticket filters use the shared `Chips` component. The authority dashboard tab is labelled "Home" so all five tabs fit a 375px phone.

**Auth**: email or phone login, register, session restored on app start, role decides which screens appear. The login and register screens have a language picker too.

**Logging out (every role)**: one shared log out for passengers, staff and officers (`useLogout` in `src/hooks/use-logout.ts`, `LogoutButton` and `AccountBar` in `src/components/auth/`). Every role's home screen starts with an account bar: the person's initial in their role colour, their name, role and email or phone, and a **Log out** button. Profile, Shift and the authority Dashboard keep a full-width **Log out** at the bottom. Before logging out the app asks for confirmation (the browser dialog on the web), and adds what will be lost: a staff member's shift, or a ticket payment still being confirmed. Logging out (and a session that ends because its token could not be refreshed) clears the account's data: the auth store resets the session, the ticket cache, the shift and the alert banner (`src/store/auth.ts`); the root layout closes the live socket and removes cached account queries, keeping only public routes and timetables (`src/app/_layout.tsx`). The route guard then shows the login screen.

**Artwork**: RideTrack's own app icon (a bus inside a map pin, in the brand blue), Android adaptive and themed icons, splash screen, web favicon and iOS Liquid Glass icon layers. Flat illustrations show on the login and register screens and on the empty states for no tickets, no alerts (passenger and authority) and no routes or nearby stops (`EmptyState`'s `illustration` prop). Each role's home screen starts with a welcome card in its own colour (passenger blue, staff teal, authority indigo, admin violet; `heroColors` in `src/theme`) holding a flat illustration drawn for that colour (`DashboardHero` in `src/components/ui`). The card is a deeper shade in dark mode, and the illustrations' backdrop shapes are see-through white, so the same picture fits both. The art is original; Pinterest searches for transit app icons and flat transport illustrations were used only as style references. Illustrations are decorative and hidden from screen readers.

**Loading animation**: loading time is covered by a small looping street scene instead of a spinner: the blue RideTrack bus drives through a Colombo-style street while a tuk-tuk and a car pass in the other lane, a three-car train crosses the elevated line and the skyline (with a lotus-bud tower) slides by. Light mode is daytime; dark mode is night with lit windows, stars and a moon. The artwork is original, drawn as plain shapes in `src/components/loading/scene.ts` (no image or video files), and the same data is rendered three ways:
- In-screen loading states: `Loading` (`src/components/ui/Loading.tsx`) shows a 112 px tall scene above its label, so every "Loading tickets…", "Searching routes…" and similar state uses it with no screen changes.
- App start: `BootLoader` covers the app from the native splash until the saved session is known, on the splash's own blue (or the dark background), then fades into the first screen (`src/app/_layout.tsx`). It stays at least 1.2 s so it never just flashes; time already spent loading counts towards that.
- Web: `src/app/+html.tsx` puts the same scene, as plain SVG animated with CSS (`BootScreenHtml`), into the static HTML, so the page is not blank while the JavaScript downloads (for example on mobile data after scanning the QR code). The app removes it once its own loader is on screen.
It uses `react-native-svg` and the built-in `Animated` API (native driver on phones), so no new dependency.

### Languages (Google Translate)

The app is written in English and translated at run time with the Google Cloud Translation API (`src/i18n/`).

- `useT()` returns `t(text, params?)`. Values that change go in `{placeholders}` (`t('Pay {amount}', { amount })`), so each sentence is translated once, not once per value.
- Strings a screen asks for are batched into one request (up to 100 per call). Results are kept on the device (`ridetrack.language` in AsyncStorage), so each string is only translated once per language and works offline afterwards.
- English shows until the translation arrives, when there is no API key, or when the request fails (retried after a minute). When Google rejects a request (bad key, API not enabled, billing off), its error message is shown under the language picker. If Google drops a `{placeholder}`, that string stays in English rather than showing a broken sentence.
- Shared components (`Button`, `TextField`, `EmptyState`, `ErrorMessage`, `Loading`, `StatusBadge`, `Chips`, ...) translate their text props themselves, so screens pass English. Language names in the picker are never translated.
- Which language: the signed-in account's `language` wins; before login the device keeps the last language picked. Profile → Save sends it to the account.
- Translated: auth screens and all passenger screens, plus alert messages from the server. Staff and Authority screens only get the shared components translated (they have no language setting).
- Setup: in Google Cloud Console enable the **Cloud Translation API** (billing must be on for the project), create an API key, and set it as `EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY` (in `.env.local`, EAS and Vercel). `EXPO_PUBLIC_*` values are baked in when the bundle is built, so restart with `npx expo start -c` (or redeploy) after setting it. The key is built into the app, so restrict it to the Cloud Translation API and to the app's Android package / web domain. Google bills per character after the free tier.

## Folder structure

```
src/
├── app/                  Expo Router screens (a file = a route)
│   ├── (auth)/           login, register
│   ├── (passenger)/      home, tickets, alerts, profile (tabs) + route/[id], map/[id], buy/[routeId], ticket/[id]
│   ├── (staff)/          scan (index), count, shift tabs
│   ├── (authority)/      dashboard (index), fleet, reports, alerts tabs
│   │   └── admin/        Admin tab, a stack: overview (index), users, new-account, vehicles, routes, trips, tickets
│   └── +html.tsx         web only: the HTML page every route renders into, with the boot screen
├── api/                  axios client, typed endpoint wrappers, mock API (mock-sri-lanka.ts: the Sri Lanka network; mock-dubai.ts: Dubai from the real timetable)
│   └── mock-data/        dubai-rta.json: Dubai RTA routes, stops, zones and timetables (generated by RideTrack-API)
├── components/           ui/ (shared), auth/, routes/, map/, tickets/, scan/, alerts/, ops/ (incl. OperatorFilter), admin/, loading/ (loading animation: scene artwork, LoadingScene, BootLoader, web BootScreenHtml)
├── i18n/                 useT() / <T>, Google Translate client (batching, retry)
├── hooks/                use-nearby-stops, use-live-vehicles, use-tickets, use-admin, use-tab-bar-options, ...
├── store/                Zustand stores: auth, favourites, tickets, shift, alert-banner, language
├── socket/               socket.io client
├── config/ theme/ types/ utils/   (config/regions.ts: which regions this build shows; utils/fare.ts: fare rule by stop or by zone, with a minimum fare; utils/format.ts: currency, local time, route and operator labels)
assets/
├── images/               app icon, adaptive icon layers, splash, favicon (PNG, used by app.json)
│   └── illustrations/    auth-hero, empty-tickets, empty-alerts, empty-routes, hero-passenger, hero-staff, hero-authority, hero-admin at @1x/@2x/@3x
├── source/               SVG sources of the illustrations
└── expo.icon/            iOS icon (Icon Composer format): pin and bus layers
scripts/render-assets.js  draws the icon set and renders every SVG above to PNG
```

Rules: screens in `app/` stay thin and call hooks and components; all network calls live in `src/api/endpoints.ts` (never call axios from a screen); keep non-route code out of `src/app/`.

## Testing

Automated tests run with Jest, `jest-expo` and React Native Testing Library (`npm test`). They live next to the code in `__tests__` folders (never inside `src/app/`, where files become routes):

- `src/utils/__tests__/validation.test.ts`: login and register rules, and the admin forms (new staff account, new vehicle).
- `src/utils/__tests__/greeting.test.ts`: the welcome card greeting (morning, afternoon, evening; first name only, left out when there is none).
- `src/api/__tests__/admin.test.ts`: the mock admin API: creating accounts (own password, duplicate email), disabling blocks login, role filter, vehicle route rules, out-of-service vehicles drop out of trips, ticket paging.
- `src/__tests__/login.test.tsx`: the login screen (empty fields, wrong password, success).
- `src/components/scan/__tests__/ScanResultPanel.test.tsx`: VALID / INVALID result, icon and text, reset.
- `src/store/__tests__/auth-logout.test.ts`: logging out clears the account, its tickets and pending payments, the staff shift and the alert banner, and removes the saved session.
- `src/components/auth/__tests__/LogoutButton.test.tsx`: each role logs out after confirming, cancelling keeps you logged in, staff are warned their shift will end, and the account bar shows who is logged in.
- `src/api/__tests__/ticket-flow.test.ts`: buy, pay, QR, scan once, cancel and history against the mock backend.
- `src/i18n/__tests__/use-t.test.ts`: English fallback, stored translations, placeholder filling and lost-placeholder fallback.
- `src/i18n/__tests__/google-translate.test.ts`: batching and de-duplicating strings into one Google Translate request, and keeping Google's error message on failure (fetch mocked).
- `src/api/__tests__/sri-lanka.test.ts`: the default Sri Lanka-only build: the eight routes with operators and minimum fares, route 138's and the Coastal Line's stops in order, no Dubai stops even near Dubai, SLTB / private / railway vehicles on the dashboard, a Sri Lanka-only back office, and reading `EXPO_PUBLIC_REGIONS`.
- `src/api/__tests__/ticket-flow.test.ts` also checks that a short bus trip is charged the Rs. 27 minimum fare.
- `src/components/loading/__tests__/scene.test.ts`: the loading animation artwork: every repeating layer stays inside its tile (so the loop has no seam), every vehicle stays inside its box, both palettes define every colour used, and the scroll and crossing timings.
- `src/api/__tests__/dubai.test.ts` runs as a build with Dubai switched on: Dubai routes by region, the Red Line's real stations with zones and running times, arrivals that match the timetable in Dubai time, AED zone fares on a ticket, vehicles placed along the route; plus the fare rule, rupee and dirham formatting, and times on a route's clock.

Not automated yet: map screens, the camera scanner, payment in the browser, push notifications. Those need a device.

## Release

- Android package: `com.ridetrack.app` (change it in `app.json` before the first store upload; it cannot change afterwards).
- Build profiles are in `eas.json`: `development` (dev client APK, real API), `preview` (APK for testers, mock API on) and `production` (AAB for the Play Store, mock API off).
- To build: `npx eas-cli@latest login`, then `npx eas-cli@latest build --platform android --profile preview`. For production, set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_SOCKET_URL` as EAS environment variables first.
- Web (Vercel): `vercel.json` tells Vercel to run `npm install`, then `npx expo export -p web`, and serve `dist/`, with a rewrite so dynamic routes such as `/ticket/123` fall back to the app instead of a 404. The Vercel project's Root Directory is currently `src`, so `src/vercel.json` does the same from there (installs and builds from the repo root, outputs to `src/dist`); delete it once Root Directory is cleared. In the Vercel project, leave Framework Preset as "Other" and add the `EXPO_PUBLIC_*` variables (from `.env.example`) under Settings → Environment Variables. They are baked in at build time, so redeploy after changing them.
- App icon and splash are RideTrack artwork. The splash is the brand blue (`#0B5FFF`), or `#0B0E14` in dark mode. To change the art, edit `assets/source/*.svg` (illustrations) or the mark in `scripts/render-assets.js` (icons), then run `npm install --no-save @resvg/resvg-js` and `node scripts/render-assets.js` from the project root. It rewrites the PNGs in `assets/images/` and the iOS layers in `assets/expo.icon/Assets/`.

## Accessibility

Body text is at least 16 pt, touch targets are at least 44 px, and status is always shown by icon and text, never colour alone (NFR8). The bottom of the login and register screens uses emoji too (👋 … ✨ on login, 🙌 … 🔑 on register, and 🌐 on the Language heading, which also shows on Profile); they sit outside the translated text so translations are unchanged. Every text and background colour pair in the light and dark themes was checked for a contrast ratio of at least 4.5:1. That includes the white text on the dashboard welcome cards (5.1:1 or more, and 4.6:1 or more where the card's faint bubbles pass under it) and the card-coloured text on their white labels. The welcome card illustrations are hidden from screen readers, and the emoji on section headings, dashboard tiles and admin rows are too, since the text beside them says the same thing. The very large numerals (scan result, passenger count, dashboard tiles) cap their font scaling at 1.2 to 1.3 times so they cannot overflow. Tab labels are 14 pt, below the 16 pt body size. Each tab has an emoji icon beside its label (🏠 🎫 🔔 👤 for passengers, 📷 🧍 🕒 for staff, 📊 🚌 📈 🔔 🛠️ for authority; `src/components/ui/TabEmoji.tsx`). All three roles share one tab bar style from `src/hooks/use-tab-bar-options.ts`, which takes the role so the active label is in that role's accent colour; a change there applies to every role. Emoji ignore the tint colour, so the active emoji sits on a pill tinted with the accent and inactive ones are dimmed. The active tab is also shown by its label's colour and weight, and the emoji are hidden from screen readers because the label already says the same thing. The role accents are at least 5.4:1 on white in light mode and use lighter tints in dark mode, and secondary text stays above 7:1 on the new grey page. The loading animation is decorative and hidden from screen readers: the loader itself is announced as a progress bar with its label ("Loading tickets…", "Loading RideTrack"). With the system's reduce motion setting on (`prefers-reduced-motion` on the web), the scene is drawn still. The white text on the blue start-up screen is 5.1:1.

## Known limitations

- Sri Lanka demo data: stop positions are approximate (town centres and stations), and fares are indicative demo fares, not the NTC fare table or Sri Lanka Railways' class fares (the Rs. 27 bus minimum is the real one). Bus timetables, trips and vehicle positions are made up; each route runs one direction only.
- The real backend (RideTrack-API) does not have the Sri Lanka network, operators or minimum fares yet; that needs a change to its seed and route/vehicle responses.
- In a Sri Lanka-only build against a backend that also holds Dubai, the admin Vehicles, Trips and Tickets lists and the overview counts still include Dubai (the app cannot tell a vehicle's region from those responses). Seed the backend without Dubai for a Sri Lanka-only deployment.
- The login screen test (`src/__tests__/login.test.tsx`) can time out at 5 s when the whole suite runs at once on a slow machine; it passes on a rerun or on its own.

- Map markers jump between positions instead of animating.
- Dubai: RTA publishes no open live GPS feed, so Dubai vehicles are simulated (`npm run simulate` on the real backend; computed from the timetable in mock mode). The timetable comes from a GTFS feed valid 29 Aug to 31 Dec 2025; its weekly pattern is repeated every week, so later service changes and public holidays are not reflected. Short workings are left out, and running times are the median for each line. Fares are Nol Silver single-trip prices; Gold class, transfers within 30 minutes and day passes are not modelled.
- Only a few Dubai bus routes are loaded (C01, 27, 8, X28); the importer in RideTrack-API can add more.
- With Dubai loaded, a whole day's trips for all routes is more than the 500 the server returns, so the admin Trips list for "All routes" stops part-way through the day. Pick a route to see its full day.
- Mock mode ships the Dubai data file (60 KB) in every build, because the mock API is bundled whether or not it is used.
- No Arabic: the language choices are still English, Sinhala and Tamil.
- The map is native only; the web build shows a notice instead.
- Android release builds need a Google Maps API key in `app.json`.
- Checked against the real backend (RideTrack-API): login, routes, arrivals, nearby stops, buying and paying for a ticket, ticket list, `POST /scans`, publishing an alert, `GET /ops/dashboard`, reports and every `/admin/*` endpoint. Not yet checked against it: `POST /vehicles/:id/occupancy` and `PUT /users/me/push-token`.
- On the real backend, `GET /alerts` only returns alerts sent to the signed-in user, and officers are never recipients, so the authority's "Published alerts" list stays empty there. It needs a backend endpoint for all alerts.
- The admin overview needs the RideTrack-API fix that renames the `delayed` column alias in `src/modules/admin/service.js` (`DELAYED` is a reserved word in MySQL); without it `GET /admin/overview` returns a 500.
- The admin panel cannot yet create or edit routes, stops or trips, or change a staff member's vehicle after the account is made (the backend supports the last one: `PATCH /admin/users/:id` with `vehicleId`). There is no way to delete an account, only to disable it.
- In mock mode a ticket can only be scanned if it was bought in the same app session (the mock data lives in memory).
- Translation is machine translation from Google Translate, not reviewed by a Sinhala or Tamil speaker. The first time a screen opens in a new language it shows English for a moment until the translation arrives, and stays English offline until it has been translated once. Real Google translation has not yet been checked with a live API key.
- The Google Translate API key ships inside the app. Restrict it in Google Cloud Console; a backend proxy would hide it completely.
- Dates and times still use the device's locale format, not the chosen language.
- The API is reached over plain `http://` on the local network, so traffic between phone and PC is not encrypted, and the `preview` APK and the HTTPS web site (Vercel) cannot use live data yet. Both need the API behind an HTTPS address.
- `.env` is git-ignored, so EAS cloud builds do not receive it. Set `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SOCKET_URL`, `EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY` and `GOOGLE_MAPS_API_KEY` as EAS environment variables for any build that needs them.
- Push notifications need a development build on Android (Expo Go no longer supports remote push there); the in-app banner and Alerts tab work everywhere. The exact body of `PUT /users/me/push-token` (`{token}`, a native FCM/APNs token) is assumed.
- Report, dashboard and admin data in mock mode is fake (deterministic numbers and generated trips), and admin changes in mock mode are lost when the app reloads.
- Not yet done for Phase 8: testing on real Android devices (including a low-end one), airplane-mode checks, a screen reader pass, a usability test with commuters and staff, and the real EAS build.
- Offline route data can be up to 24 hours old; arrivals shown offline are the last ones fetched.
- Lint reports one existing warning in `src/api/client.ts` (axios import style).
- The dashboard welcome cards have only been checked in the browser, not on a phone.
- The new icons and splash have not been seen on a device yet: the splash only shows in a real build (not Expo Go), and the iOS Liquid Glass icon (`assets/expo.icon`) has not been opened in Icon Composer or built for iOS.
- The Figma file is on the Starter plan, which allows only 3 pages and one variable mode, so light and dark colours are two separate collections and every screen is drawn in light mode only. Some small details in the Figma screens still differ from the app: the icon bubbles on stat tiles, nav rows and admin avatars show the full colour instead of the 14% tint the app uses, the "LKR 1.07M" tile value and the long vehicle buttons on Admin / Vehicles overflow, and Sinhala labels read "Sinhala" because Figma has no Sinhala font installed. The app follows the intended design.
- The redesigned tab bar, cards and screen headers have only been checked in the browser, not on a phone.
- Logging out only ends the session on the device. RideTrack-API has no logout endpoint for app users (only for its admin site) and no way to remove a push token, so the refresh token stays valid on the server until it expires, and the phone's push token stays linked to the account until someone else registers it.
- The loading animation has only been checked in the browser. On a phone the native driver runs it; how smooth it is on a low-end Android, and the iOS splash fade into the start-up loader, still need checking on a device. On the web boot screen the tuk-tuk, car and train timings assume a scene about 400 px wide (CSS cannot read the width), so on a wider screen they cross a little faster.
- Unused Expo template images (`expo-badge*`, `expo-logo`, `react-logo*`, `logo-glow`, `tutorial-web`, `tabIcons/`) are still in `assets/images/`.

## Comparison with LMT GO (Lanka Metro Transit)

Reference: the public LMT GO app description ([store listing summary](https://mwm.ai/apps/lmt-go/6761980523), [GPS tracking news](https://www.newswire.lk/9mzi)). Only the public description was used, not the app itself.

| LMT GO feature | RideTrack |
|---|---|
| Live bus map and arrival times | Done |
| Live occupancy | Done |
| QR tickets, valid offline | Done |
| Offline routes and timetables | Done (24 h cache) |
| Service alerts | Done (delays, cancellations, route changes); no "bus approaching" alert yet |
| Sinhala, Tamil, English | Done (Google Translate, not yet reviewed by native speakers) |
| SLTB and private buses and trains in one app | Done in demo mode (operator shown on routes and vehicles, operator filter for officers) |
| Browse stops and routes without an account | Not done: the app needs login first |
| E-wallet balance, day/week/month passes | Not done: needs new screens and backend support |
| Journey planner (transfers, walking, fare) | Not done: needs a new screen and backend support |
| Book wheelchair space | Not done: needs a new screen and backend support |

The "not done" rows all need new screens or API endpoints, so they were left out to keep the current UI unchanged.

## Keeping this README current

This README is part of the code. Whenever a change adds or alters a screen, feature, script, environment variable, dependency, folder, or known limitation, update the matching section in the same commit, especially **Project status**, **Features built so far** and **Known limitations**. This rule is also in `AGENTS.md` so coding agents follow it.
