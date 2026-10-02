# Git Workflow

## Branch model

```
main     ●─────────────────────────●──────────  stable, release only
          \                       /
dev        ●───●───●───●───●───●─●────────────  integration of all members' work
                \     / \     /
feature/silva/…  ●───●   ●───●                  one short-lived branch per task
```

| Branch | Purpose | Who merges | Direct push |
|---|---|---|---|
| `main` | Stable, demo-ready code and APK builds | Team leader (Silva), from `dev` only | No |
| `dev` | Integration branch; all feature work lands here first | Any member, after review | No |
| `feature/<member>/<task>` | One screen or task | Its owner | Yes (own branch) |
| `fix/<member>/<task>` | Bug fix found in testing | Its owner | Yes (own branch) |

## Naming

`feature/<member>/<task>` in lowercase, words separated by hyphens. `<member>` is the owner's surname.

| Member | Prefix | Examples |
|---|---|---|
| Silva | `feature/silva/` | `feature/silva/search-results`, `feature/silva/live-tracking` |
| Rajapaksha | `feature/rajapaksha/` | `feature/rajapaksha/payment`, `feature/rajapaksha/digital-ticket` |
| Herath | `feature/herath/` | `feature/herath/scan-ticket`, `feature/herath/report-incident` |
| Fernando | `feature/fernando/` | `feature/fernando/vehicle-mgmt`, `feature/fernando/firestore-rules` |

Bug fixes use the same shape: `fix/herath/scan-reuse-check`.

## Daily routine

```bash
git checkout dev
git pull
git checkout -b feature/silva/search-results

# work, then
git add <files>
git commit -m "feat(search): add results list"
git push -u origin feature/silva/search-results
```

Open a pull request from your branch **into `dev`**.

## Pull requests

- Target `dev`, never `main`.
- Title follows the commit format; the description names the screen and links the task in [MEMBERS.md](MEMBERS.md).
- At least one teammate reviews and runs the app before merging.
- Tick the task in MEMBERS.md and TASKS.md in the same PR.
- Delete the feature branch after it is merged.
- Keep `dev` runnable: do not merge a PR that breaks `npx expo start`.

## Releasing to main

1. All planned screens are merged into `dev` and tested.
2. Silva opens a PR from `dev` into `main`.
3. The team checks the build on a clean clone.
4. Merge, then tag the release (for example `v1.0.0`) and build the APK from `main`.

## Commit messages

`type(area): short summary`

- type: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- area: `search`, `booking`, `conductor`, `authority`, `shared`

Example: `fix(conductor): block reuse of scanned ticket`

## Keeping your branch up to date

```bash
git checkout dev
git pull
git checkout feature/silva/search-results
git merge dev
```

Resolve conflicts on your branch, run the app, then push.

## Secrets

- Never commit `.env` or any key. `.gitignore` already excludes `.env`.
- Share Firebase keys privately (ask Fernando).
- If a key is committed by mistake, tell the group and rotate it.

## Ownership

Edit your own area's folder. Changes to `src/lib/`, `src/store/`, shared `src/components/`, or the Firestore schema should be agreed in the group chat first to avoid conflicts.
