// AsyncStorage has a native module; use the library's in-memory mock under Jest.
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

// Reanimated and Worklets need native modules; use the libraries' own JS mocks so animated components render instantly.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
// the mock has no useReducedMotion; report motion as allowed
jest.mock('react-native-reanimated', () => ({ ...require('react-native-reanimated/mock'), useReducedMotion: () => false }));
