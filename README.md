# 同人创作助手 / Fanfic Creator Platform

A full-stack platform for fan-fiction creators — turn story text into shareable images, generate fake forum/social-media screenshots, and build playable visual novels. Ships as a web app and a WeChat Mini Program, sharing ~70% of business logic through a common package.

---

## Architecture

```
Fan-Fiction-Creation-Assistant/
├── apps/
│   └── api/                  Fastify 4 backend (Node.js 20)
├── packages/
│   ├── shared/               Types, Zod schemas, utilities, API client
│   ├── web/                  React 18 + Vite 5 web app
│   └── miniprogram/          Taro 4 WeChat Mini Program
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

**Key principle:** `packages/shared` is the single source of truth. Every TypeScript interface, every Zod schema, every platform-agnostic utility lives there. Neither the web app nor the API defines a shared type independently.

---

## Features

### 1. Text-to-Image (`/text-to-image`)
Convert story text into polished social-media images.

- Live preview updates on every keystroke (no debounce needed — DOM only)
- Platform presets: Weibo portrait (1080×1440), Xiaohongshu square/portrait, or custom dimensions
- Resolution multiplier 1×/2×/3× — multiplies canvas pixel dimensions at export time, CSS layout stays at 1×
- Rotation: 0° / 90° CW / 90° CCW / 180° applied as a canvas transform on export
- Long text is automatically segmented at sentence boundaries (`segmentText`) and exported as a multi-page ZIP via JSZip
- Font loading uses the FontFace API; `document.fonts.ready` + `document.fonts.check()` are both awaited before any screenshot to prevent the silent system-font fallback bug

### 2. Forum Post Generator (`/forum-post`)
Generate realistic forum/social thread screenshots.

- Three renderer styles: **BBS** (tieba-style), **Twitter**, **Weibo**
- Switch styles without losing any post data (`PostData` is style-agnostic)
- Per-floor editor: edit username, content, OP flag
- Usernames are generated deterministically from a floor-number seed (`generateUsername`) — same floor always produces the same name
- Avatar colours derived by hashing the username string into a fixed 24-colour palette — no storage needed, always consistent
- Export: html2canvas renders the full thread, `splitImageByHeight` slices it into equal segments, all packed into a ZIP

### 3. Visual Novel Engine (`/visual-novel`)
Create and play branching visual novels driven by Ink scripts.

- **Ink.js** handles all story logic (branching, variables, visit counts, knots). The platform only provides the renderer.
- `useInkStory` hook is the only place in the codebase that instantiates `Story` — exposes `{ currentText, currentChoices, canContinue, choose, saveState, loadState }`
- Asset references in Ink scripts use tags parsed by `parseInkTag`:
  ```
  # show: character_name, expression, left|center|right
  # hide: character_name
  # bg: scene_name
  # music: track_name
  # save
  ```
- Sprite layer: absolutely positioned images at left/center/right anchors with CSS transitions
- Dialogue box: fully configurable via `DialogueStyleConfig` (colours, font, opacity, border radius, name plate style)
- 5 save slots per project; saves are upserted atomically (Ink state JSON + scene state JSON together)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Language | TypeScript 5 everywhere |
| Web frontend | React 18, Vite 5, Tailwind CSS 3, Zustand 4, React Query 5, React Router 6 |
| Mini Program | Taro 4 (React syntax) |
| Backend | Fastify 4, Prisma 5, Zod 3 |
| Database | PostgreSQL 15 |
| Cache / tokens | Redis 7 |
| Object storage | Tencent Cloud COS (streaming via Busboy, no disk buffer) |
| Image export (web) | html2canvas + JSZip |
| Image export (MP) | wx Canvas 2D API (html2canvas does not run in MP) |
| Story engine | Ink.js |
| Auth | JWT (15-min access token, 30-day refresh, 7-day guest) |

---

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`npm install -g pnpm`)
- **PostgreSQL** 15 running locally (or a connection string)
- **Redis** 7 running locally

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/sharemoonwithcoke/fan-fiction-creation-assistant.git
cd fan-fiction-creation-assistant
pnpm install
```

### 2. Configure the API

```bash
cp apps/api/.env.example apps/api/.env
```

Open `apps/api/.env` and fill in at minimum:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/fanfic
REDIS_URL=redis://localhost:6379
JWT_SECRET=some-random-string-at-least-32-characters-long
```

Everything else (WeChat credentials, COS keys) can be left blank for local development — the API will use stub/dev fallbacks.

### 3. Initialise the database

```bash
pnpm --filter @fanfic/api db:migrate
```

This runs `prisma migrate dev`, creates all tables, and generates the Prisma client.

### 4. Start everything

```bash
pnpm dev
```

This starts all packages in parallel:

| Service | URL |
|---|---|
| Web app | http://localhost:5173 |
| API server | http://localhost:3000 |

The web app proxies `/api/*` to `localhost:3000` via Vite's `server.proxy`, so no CORS configuration is needed locally.

To start only one package:

```bash
pnpm --filter @fanfic/web dev       # web only
pnpm --filter @fanfic/api dev       # api only
```

---

## Running Tests

```bash
pnpm test                            # run all packages
pnpm --filter @fanfic/shared test    # shared utilities only
```

The shared package tests cover:
- `segmentText` — sentence-boundary splitting, hard-break fallback, no empty segments
- `generateUsername` / `getAvatarColor` — determinism, consistent hash colouring
- `parseInkTag` — all tag types (show / hide / bg / music / save / unknown)

---

## Building for Production

```bash
pnpm build
```

### Web

Output lands in `packages/web/dist/`. Deploy to Vercel by connecting the repo — the GitHub Actions deploy workflow handles it automatically on push to `main`.

### API

```bash
pnpm --filter @fanfic/api build      # compiles to apps/api/dist/
pnpm --filter @fanfic/api db:deploy  # runs prisma migrate deploy (safe for prod)
pnpm --filter @fanfic/api start      # node dist/server.js
```

On the server, use **PM2** to keep the process alive:

```bash
pm2 start dist/server.js --name fanfic-api
pm2 save
```

Put **Nginx** in front as a reverse proxy:

```nginx
server {
    listen 443 ssl;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### WeChat Mini Program

```bash
pnpm --filter @fanfic/miniprogram build:weapp
```

Open the `packages/miniprogram/dist/weapp` directory in the WeChat DevTools, then submit through the WeChat Open Platform. Remember to whitelist your API domain in the MP console and ensure an ICP filing is in place (takes 3–8 weeks — start early).

---

## Environment Variables (API)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `JWT_SECRET` | Yes | ≥ 32 characters, kept secret |
| `JWT_ACCESS_EXPIRES` | No | Default `15m` |
| `JWT_REFRESH_EXPIRES_SECONDS` | No | Default `2592000` (30 days) |
| `JWT_GUEST_EXPIRES_SECONDS` | No | Default `604800` (7 days) |
| `WECHAT_APP_ID` | MP only | WeChat Mini Program App ID |
| `WECHAT_APP_SECRET` | MP only | WeChat Mini Program App Secret |
| `COS_SECRET_ID` | Uploads | Tencent Cloud COS credential |
| `COS_SECRET_KEY` | Uploads | Tencent Cloud COS credential |
| `COS_BUCKET` | Uploads | e.g. `fanfic-prod-1234567890` |
| `COS_REGION` | Uploads | Default `ap-guangzhou` |
| `COS_CDN_BASE` | Uploads | CDN origin for asset URLs |
| `CORS_ORIGIN` | No | Comma-separated allowed origins |
| `PORT` | No | Default `3000` |

When `COS_SECRET_ID` is not set, file uploads still work — the file is consumed but a dev placeholder URL is stored. This is sufficient for local development.

---

## CI / CD

GitHub Actions runs on every push and pull request:

1. **Lint** — ESLint across all packages
2. **Typecheck** — `tsc --noEmit` in each package
3. **Test** — Vitest with a real PostgreSQL and Redis via service containers
4. **Build** — web + API

On merge to `main`, a separate deploy workflow:
- Runs `prisma migrate deploy` as a pre-deploy step
- SSH-deploys the API to a Tencent Cloud Lighthouse instance via PM2 restart
- Triggers a Vercel production deployment for the web app

---

## Project Structure (detail)

```
packages/shared/src/
├── types/          TypeScript interfaces (User, Project, PostData, GameSave, …)
├── schemas/        Zod schemas for all API request bodies
├── utils/
│   ├── text-segment.ts       segmentText() — sentence-boundary page splitting
│   ├── username-generator.ts generateUsername() + getAvatarColor()
│   ├── ink-tag-parser.ts     parseInkTag() — parses show/hide/bg/music/save tags
│   └── image-split.ts        splitImageByHeight() + canvasToBlob()
└── api/
    └── client.ts   createApiClient() factory — used by web and MP

apps/api/src/
├── routes/         auth, projects, assets, games, templates
├── plugins/        prisma, redis (registered as Fastify plugins)
├── middleware/     requireAuth, requireGuest, requireAdmin
├── env.ts          Zod-validated environment config
└── app.ts          Fastify app factory

packages/web/src/
├── store/          Zustand stores (auth, guest)
├── hooks/          useApi, useProjects, useFontLoader, useInkStory
├── lib/            imageExport.ts (html2canvas + JSZip pipeline)
├── components/     Button, Input, Layout
└── pages/          LoginPage, RegisterPage, Dashboard, TextToImage,
                    ForumPost, VisualNovel, Projects

packages/miniprogram/src/
├── lib/            imageGenerator.ts — wx Canvas 2D adapter
├── hooks/          useInkStory (identical API to web version)
├── store/          auth (Taro.getStorageSync)
└── pages/          index, text-to-image, forum-post, visual-novel, login
```

---

## Guest Mode and Data Migration

On first load, the API issues a guest JWT (7-day TTL). Guest data is written to **IndexedDB** namespaced under the guest token. On registration or WeChat login, the frontend collects all IndexedDB data (up to 50 MB) and calls `POST /api/v1/auth/migrate`. The backend opens a single DB transaction, inserts all projects and assets, writes a `migration_log` record, marks the guest token as consumed in Redis, and commits. IndexedDB is only cleared after a 200 response — if anything fails, it is left intact and the user can retry. The endpoint is idempotent; a consumed guest token returns 409.

---

## License

MIT
