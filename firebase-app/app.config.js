// Extends app.json. Adds the Google Maps key to the Android build so the installed APK can draw
// maps. Expo Go does not need it. The key is read from EXPO_PUBLIC_MAPS_API_KEY: from your local
// .env while developing, and from an EAS environment variable during `eas build`.
// Full steps: docs/design/MAPS-SETUP.md

const mapsKey = process.env.EXPO_PUBLIC_MAPS_API_KEY;

module.exports = ({ config }) => {
  if (!mapsKey && process.env.EAS_BUILD === 'true') {
    // Fail loudly rather than ship an APK whose maps are blank.
    throw new Error(
      'EXPO_PUBLIC_MAPS_API_KEY is not set for this build. Add it with `eas env:set` (see docs/design/MAPS-SETUP.md).',
    );
  }

  return {
    ...config,
    plugins: mapsKey
      ? [...(config.plugins ?? []), ['react-native-maps', { androidGoogleMapsApiKey: mapsKey }]]
      : config.plugins,
  };
};
