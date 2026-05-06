# Cloudflare Pages Setup

## Local development

1. Copy `.dev.vars.example` to `.dev.vars`.
2. Replace the placeholder values in `.dev.vars`.
3. Run `node build-pages.mjs`.
4. Run `wrangler pages dev public`.
5. Open `http://127.0.0.1:8788/login.html`.

## Git-connected Pages project

Use a Pages project, not a Worker deploy.

- Framework preset: `None`
- Build command: `node build-pages.mjs`
- Build output directory: `public`
- Root directory: leave blank unless this repo is inside a larger monorepo

Do not use `npx wrangler deploy` as the Pages build command. That creates a Worker deployment instead of a Pages deployment.

## Required secrets in Cloudflare Pages

Add these encrypted secrets in your Pages project settings for both Preview and Production:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`

## Deploy notes

- Build output directory: `public`
- Functions directory: `functions`
- Protected portal route: `/portal.html`
- Login route: `/login.html`
- Logout route: `/api/logout`

## Recommended secret generation

Use a long random value for `SESSION_SECRET`. For example:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```
