# Google Maps Key for the APK

Expo Go draws maps without any key. The **installed APK** needs a Google Maps API key, otherwise Live Tracking shows a grey grid. This page covers creating the key, protecting it, and building the APK with it.

Android package name (fixed in `app.json`): `com.ridetrack.app`. If this ever changes, the key restriction in step 5 must change with it.

## What the repo already does

| File | Job |
|---|---|
| `app.config.js` | Reads `EXPO_PUBLIC_MAPS_API_KEY` and adds the `react-native-maps` plugin, which writes the key into the Android manifest. During `eas build` it stops with a clear error if the key is missing, so you never ship a blank map. |
| `app.json` | Holds the Android package name `com.ridetrack.app`. |
| `eas.json` | Build profiles: `development`, `preview` (installable APK) and `production`. Each reads the EAS environment of the same name. |
| `package.json` | `npm run build:apk` builds the preview APK. |
| `src/app/(passenger)/track/[id].tsx` | `MapView` uses the Google provider. |

## Part A: create the key (project owner, in a browser)

Needs a Google account and a billing account with a card. Maps is free for small projects up to Google's monthly usage limits, but Google requires billing to be on. Check the current [pricing page](https://mapsplatform.google.com/pricing/) and set a budget alert (step 6).

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and create a project named `ridetrack`.
2. **Billing**: link a billing account to the project.
3. **APIs & Services, Library**: search **Maps SDK for Android** and click **Enable**.
4. Get the app's signing fingerprint (SHA-1). From a terminal in this repo:

   ```bash
   npx eas-cli@latest login
   npx eas-cli@latest init
   npx eas-cli@latest credentials -p android
   ```

   `init` links the project to your Expo account (it adds `extra.eas.projectId` to `app.json`; commit that). In `credentials`, choose the `preview` profile, then **Keystore** and set up a new keystore if there is none. It prints the **SHA1 Fingerprint**. Copy it.
5. **APIs & Services, Credentials, Create credentials, API key**, then **Edit** it:
   - Name: `ridetrack-android`.
   - **Application restrictions**: Android apps, **Add an item**, package name `com.ridetrack.app` and the SHA-1 from step 4.
   - **API restrictions**: Restrict key, choose only **Maps SDK for Android**.
   - Save. Restrictions can take a few minutes to apply.
6. **Billing, Budgets & alerts**: add a small budget (for example 5 USD) with an email alert.

## Part B: give the key to the build

The `.env` file is not uploaded to EAS, so the build gets its variables from EAS itself. Never commit the key and never paste it in chat or the docs.

```bash
npx eas-cli@latest env:set --name EXPO_PUBLIC_MAPS_API_KEY --value <your key> --environment preview --visibility sensitive
```

Repeat with `--environment production` (and `development` if you build a development client). `sensitive` lets the config read the value while building; do not use `secret` for this one.

The APK also needs the Firebase values, for the same reason. Set each of these in the `preview` environment too, with the values from the Firebase console:

| Variable | Notes |
|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | `sensitive` |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | `plaintext` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | `plaintext` |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | `sensitive` |

For local work, copy `.env.example` to `.env` and fill in the same names. Expo Go ignores the maps key.

## Part C: build and install

```bash
npm run build:apk
```

When EAS finishes it prints a link and a QR code. Open the link on the Android phone, download the APK and install it (allow installs from the browser if asked). Put the link in the Readme links table.

## Check it worked

1. Open the app, search a route, open a trip, tap **Track Vehicle**.
2. You should see Google map tiles with the route line. A grey grid with a Google logo means the key is not accepted.
3. If the grid appears, check in order: the **Maps SDK for Android** is enabled, billing is on, the package name and SHA-1 on the key match the APK, and the variable was set for the same environment the profile uses (`preview`). With the phone connected by USB, `adb logcat | grep -i "Google Maps"` shows the exact reason.

## Safety notes

- The key is written into the APK, so anyone can extract it. The restrictions in step 5 (package name, SHA-1, Maps SDK for Android only) are what protect it. Do not skip them.
- Keep one key per purpose. If a key leaks, delete it in the console and create a new one, then update the EAS variable.
- A release build for the Play Store has a different signing key. Add that SHA-1 to the same API key when the time comes.
