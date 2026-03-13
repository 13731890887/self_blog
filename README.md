# Self Blog

Personal blog scaffold based on the "Digital Garden Noir" architecture:

- Frontend: Astro + MDX + Preact islands + Tailwind CSS v4
- API: Hono on Node.js
- Data: SQLite schema scaffold
- Deploy: Nginx reverse proxy + PM2 cluster config

## Structure

```text
.
├── api/
├── nginx/
├── scripts/
└── src/
```

## Commands

```bash
npm install
npm run dev
npm run dev:api
npm run build
```

## Next implementation steps

1. Wire custom fonts under `public/fonts/` and update `src/styles/global.css`.
2. Replace placeholder AI endpoints with provider-backed Claude and OpenAI calls.
3. Back `views`, `search`, and `mood` routes with SQLite.
4. Add auth middleware for `/admin`.
