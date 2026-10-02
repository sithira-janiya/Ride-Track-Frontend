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
- Title follows the commit format; the description names the screen and links the task in [MEMBERS.md](../project/MEMBERS.md).
- At least one teammate reviews and runs the app before merging.
- Tick the task in MEMBERS.md and TASKS.md in the same PR.
- Delete the feature branch after it is merged.
- Keep `dev` runnable: do not merge a PR that breaks `npx expo start`.

## Branch protection setup

Done once by the repository owner on GitHub (Settings, Rules, Rulesets, New branch ruleset).

**Merge order the rulesets enforce:** feature branch into `dev`, then `dev` into `main`. Nothing reaches `main` any other way.

| Branch | Who can open a PR into it | Required before merge |
|---|---|---|
| `dev` | `feature/*`, `fix/*`, `docs/*` branches | PR, 1 approval, check `dev-only-from-work-branches` |
| `main` | `dev` only | PR, 1 approval, check `main-only-from-dev` |

GitHub rulesets cannot limit where a pull request comes from, so the repo has a workflow, [`.github/workflows/branch-rules.yml`](../../.github/workflows/branch-rules.yml), that fails when the source branch is wrong. The rulesets then require its checks to pass.

**Ruleset for `main`**
1. Target branch: `main`. Enforcement: Active. Leave bypass list empty.
2. Enable "Restrict deletions" and "Block force pushes".
3. Enable "Require a pull request before merging" with 1 required approval.
4. Enable "Require status checks to pass" and add the check `main-only-from-dev`.
5. Optionally limit who can merge to the team leader.

**Ruleset for `dev`**
1. Target branch: `dev`. Enforcement: Active.
2. Enable "Restrict deletions" and "Block force pushes".
3. Enable "Require a pull request before merging" with 1 required approval.
4. Enable "Require status checks to pass" and add the check `dev-only-from-work-branches`.

A check only appears in the list after the workflow has run once, so merge this workflow into `dev` first and open one pull request, then add the checks to the rulesets.

Also set `dev` as the default branch (Settings, General) so new pull requests target it.

**Compare before merging.** Before opening a pull request, review the difference:
- Feature into `dev`: `https://github.com/sithira-janiya/RideTrack/compare/dev...<your-branch>`
- `dev` into `main`: `https://github.com/sithira-janiya/RideTrack/compare/main...dev`

Check it worked:
- A direct `git push origin main` or `git push origin dev` must be rejected.
- A pull request from a feature branch into `main` must show the failing check `main-only-from-dev` and cannot be merged.

## Releasing to main

1. All planned screens are merged into `dev` and tested.
2. Compare `dev` with `main` (link above) and read the diff.
3. Silva opens a PR from `dev` into `main`. It is the only kind of PR `main` accepts.
4. The team checks the build on a clean clone, then approves.
5. Merge, then tag the release (for example `v1.0.0`) and build the APK from `main`.

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
