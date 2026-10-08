This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Folder structure

Follow the layout in the **Folder structure** section of `README.md` for every new file. In short:

- `src/app/` holds screens only. Screens stay thin: they call feature hooks and lay out components.
- Feature code goes in `src/features/<feature>/` (`components/`, `hooks/`, `stores/`, and plain files such as `validation.ts` at its root). Create a new feature folder for a new area rather than adding to an unrelated one.
- Code that two or more features need goes in shared folders: `src/components/ui/`, `src/hooks/`, `src/utils/` (pure helpers), `src/lib/` (library set-up and device wrappers), `src/store/` (app-wide state).
- Network calls only in `src/api/endpoints.ts` (with a fake in `src/api/mock.ts`); query keys only from `src/api/query-keys.ts`.
- Imports flow screens → features → shared. Features never import each other, and shared code never imports features or screens. `npx expo lint` enforces this; fix the structure rather than disabling the rule.

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Documentation

- Keep `README.md` current as you code. In the same change that adds or alters a screen, feature, script, env var, dependency, folder, or known limitation, update the matching README section (**Project status**, **Features built so far**, **Folder structure**, **Known limitations**). Never mark a phase "Done" unless it has been run and checked.
