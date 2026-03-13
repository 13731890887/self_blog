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

Frontend dev runs on `http://localhost:4321`. API dev runs on `http://localhost:4322`, and Astro proxies `/api` plus `/health` to the API server.

## Environment

Root `.env` or shell environment:

```bash
BAILIAN_API_KEY=your_bailian_key
BAILIAN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
BAILIAN_CHAT_MODEL=qwen-plus
BAILIAN_MOOD_MODEL=qwen-plus
BRAVE_SEARCH_API_KEY=your_brave_key
BRAVE_SEARCH_BASE_URL=https://api.search.brave.com/res/v1/web/search
ADMIN_PASSWORD=your_admin_password
ADMIN_SESSION_SECRET=long_random_secret
```

Current API behavior:

- `GET /api/views?slug=...`: increments and returns SQLite-backed views
- `GET /api/ai/mood`: caches one Bailian-generated mood per day in SQLite
- `POST /api/ai/chat`: streams Alibaba Bailian responses over SSE
- `GET /api/search?q=...`: searches local SQLite FTS5 index and optionally supplements with Brave Search
- `POST /api/admin/login`: validates the admin password and issues a signed session cookie
- `GET /api/admin/session`: reports admin configuration and login state
- `POST /api/admin/assist`: protected writing-assistant endpoint for title, tags, meta description, and readability notes

## Notes

1. Wire custom fonts under `public/fonts/` and update `src/styles/global.css`.
2. Expand content indexing to include projects and tags metadata.
