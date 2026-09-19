# AGENTS.md — KCA Auth (Base44 dev environment)

## What this is
A Vite + React 19 frontend ("KCA Auth") for an authentication/licensing platform. It uses Firebase (Auth + Realtime Database) and Cloudflare Turnstile. API calls are proxied to a live backend (`https://kca-seven.vercel.app`) via the Vite proxy config in `vite.config.ts`.

## Running it
```
docker compose -f docker-compose.base44.yml up -d
```
- Node 22 image, source bind-mounted at `/app`, `npm install` + `vite dev` on startup.
- Dev server on host port 3000, bind `0.0.0.0`.
- Live reload works (Vite HMR). No image rebuild needed for code edits.

## Environment / secrets
Frontend reads `VITE_*` env vars (Firebase config, Turnstile keys, DB secret, admin email).
- `.env.base44-defaults` holds dev placeholders so the app boots without real credentials.
- Real credentials are delivered via `/run/base44/app.env` (platform-managed) and override the defaults.
- **Required for full functionality:** Firebase project credentials (API key, auth domain, database URL, project ID, storage bucket, messaging sender ID, app ID), admin email, DB secret, and Cloudflare Turnstile site/secret keys. Without these, the app renders the landing page but auth/database features won't work.

## Setup quirk: Firebase init crash
`services/firebase.ts` originally called `getDatabase()` at module load, which throws a fatal error on an invalid database URL (e.g. placeholder credentials), white-screening the entire app. It was wrapped in a try/catch so the app degrades gracefully (renders without Firebase) when config is invalid. `App.tsx` guards `onAuthStateChanged`/`onValue` calls when `auth`/`db` are null. Revert is not needed — with valid credentials Firebase initializes normally.

## Line endings
Source files use CRLF. When editing, rewrite the whole file or account for `\r` in find/replace.
