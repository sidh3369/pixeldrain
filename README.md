# Study Material Stream (Pixeldrain + Stremio)

Next.js 15 application for managing study videos, uploading to Pixeldrain, and exposing a Stremio addon.

## Setup

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

## Routes

- `/api/folders`
- `/api/files`
- `/api/upload`
- `/api/upload/[id]/status`
- `/stremio/manifest.json`
- `/stremio/catalog/movie/study_videos.json`
- `/stremio/stream/movie/:id.json`

## Render deployment

This repo includes a `render.yaml` Blueprint config that uses npm for both install and build to avoid mixed package-manager installs (`npm` + `yarn`).

```bash
# build
npm install && npx prisma generate && npm run build

# start
npm run start
```
