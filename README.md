# Atlas

Atlas is a premium static app for training logs, weekly recovery and nutrition tracking, and AI-assisted analysis.

The app is local-first and stores data in browser storage. It supports:
- Structured 5-day training sessions with set-level logs (`weight`, `reps`, `rpe`, `note`)
- Weekly bodyweight, calories, protein, steps, and sleep context
- Atlas Insights prompt + OpenAI-compatible JSON payload generation
- Optional direct endpoint calls to local model servers
- Import/export and legacy migration support
- Light, dark, and system themes

## Local development

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

Optional type check:

```bash
npm run typecheck
```

## Version history and rollback

Initialize local Git history:

```bash
git init
git add .
git commit -m "chore: baseline atlas snapshot"
```

Recommended workflow for safe iteration:

```bash
git switch -c feat/<short-name>
# make changes
git add -A
git commit -m "feat: <summary>"
```

Create a restore point tag before bigger UI changes:

```bash
git tag before-ui-pass-1
```

Rollback options:
- Undo the latest commit safely: `git revert HEAD`
- Restore to a known commit locally: `git reset --hard <commit-hash>`
- Return to a tagged snapshot: `git reset --hard before-ui-pass-1`

## Data and storage

Atlas uses:
- Primary key: `atlas.appState.v1`
- Legacy compatibility key: `aigains_atelier_v1`

Export format:
- `appName: "Atlas"`
- `schemaVersion: 1`
- `exportedAt` (ISO timestamp)
- `state`

Imports support both Atlas exports and practical legacy JSON shape from the original single-file prototype.

## Atlas Insights endpoint mode caveat

Direct browser calls to localhost can fail depending on CORS, HTTPS context, host/port mismatch, or local server headers.

When that happens, Atlas still supports copy/paste analysis:
- Copy Prompt
- Copy JSON payload

Use that flow as a reliable fallback.

## GitHub Pages deployment

This repo includes `.github/workflows/deploy.yml` for static deployment.

1. Push to the `main` branch.
2. In GitHub repo settings, open **Pages** and set **Build and deployment** source to **GitHub Actions**.
3. The workflow installs dependencies, builds `dist`, uploads, and deploys.
4. Vite `base` is set automatically during GitHub Actions using your repository name.

If your default branch is not `main`, update `.github/workflows/deploy.yml`.
