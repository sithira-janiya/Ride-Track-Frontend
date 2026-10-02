# Git Workflow

## Branches

- `main` is always runnable. Do not push to it directly.
- One branch per task: `feature/<area>-<screen>`, for example `feature/booking-payment`, `feature/conductor-scan`.
- Fix branches: `fix/<short-description>`.

## Daily routine

```bash
git checkout main
git pull
git checkout -b feature/search-results
# work, then
git add <files>
git commit -m "feat(search): add results list"
git push -u origin feature/search-results
```

## Commit messages

`type(area): short summary` where type is `feat`, `fix`, `docs`, `refactor` or `test`, and area is `search`, `booking`, `conductor`, `authority` or `shared`.

## Pull requests

- Open a PR into `main` and link the task from [TASKS.md](TASKS.md).
- At least one teammate reviews and runs the app before merging.
- Tick the task in TASKS.md in the same PR.

## Secrets

- Never commit `.env` or any key. Make sure `.gitignore` lists `.env`.
- Share Firebase keys privately (ask Fernando).
- If a key is committed by mistake, tell the group and rotate the key.

## File ownership

Edit your own area's folder. Changes to `lib/`, `store/`, shared `components/`, or the Firestore schema should be agreed in the group chat first to avoid conflicts.
