import type { ConfigContext, ExpoConfig } from 'expo/config';

// Extends app.json. Adds the Google Maps key that react-native-maps needs on Android
// (iOS uses Apple Maps via PROVIDER_DEFAULT, so it needs no key). The key is read from
// GOOGLE_MAPS_API_KEY in .env locally, or from an EAS environment variable in cloud builds,
// so it never lands in git. Restrict it in Google Cloud to "Maps SDK for Android" and the
// app's package (com.ridetrack.app) + SHA-1 signing fingerprint.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  plugins: [
    ...(config.plugins ?? []),
    ['react-native-maps', { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '' }],
  ],
});
