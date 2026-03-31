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
AI_CLI_KEY=shared_secret_for_machine_access
AI_CLI_BASE_URL=https://your-domain-or-api-host
```

Current API behavior:

- `GET /api/views?slug=...`: increments and returns SQLite-backed views
- `GET /api/ai/mood`: caches one Bailian-generated mood per day in SQLite
- `POST /api/ai/chat`: streams Alibaba Bailian responses over SSE
- `GET /api/search?q=...`: searches local SQLite FTS5 index and optionally supplements with Brave Search
- `POST /api/admin/login`: validates the admin password and issues a signed session cookie
- `GET /api/admin/session`: reports admin configuration and login state
- `POST /api/admin/assist`: protected writing-assistant endpoint for title, tags, meta description, and readability notes
- `GET/POST/PUT/DELETE /api/cli/...`: machine-authenticated content management endpoints for AI/CLI automation using `AI_CLI_KEY`

## AI CLI

Use the shared `AI_CLI_KEY` to let an AI agent or script manage blog content without browser login cookies.

```bash
npm run ai:cli -- status
npm run ai:cli -- article list
npm run ai:cli -- article get hello-agent
npm run ai:cli -- article assist --content-file ./draft.md --title "Draft"
npm run ai:cli -- article publish --title "New Post" --content-file ./draft.md --tag note --published
npm run ai:cli -- article update hello-agent --title "Updated title" --content-file ./draft.md --tags note,ai --published
npm run ai:cli -- article rename hello-agent --to hello-agent-v2
npm run ai:cli -- article diff hello-agent --content-file ./draft.md
npm run ai:cli -- article delete hello-agent
npm run ai:cli -- article import-docx --file ./draft.docx
npm run ai:cli -- asset upload --file ./cover.png --alt "Cover image"
npm run ai:cli -- asset list
npm run ai:cli -- asset delete cover.png
npm run ai:cli -- settings get
npm run ai:cli -- settings set --file ./site-settings.json
npm run ai:cli -- settings tag add --zh "AI" --en "ai"
npm run ai:cli -- comment list
npm run ai:cli -- comment get 12
npm run ai:cli -- comment reply 12 --content "Thanks for the feedback"
npm run ai:cli -- comment hide 12
npm run ai:cli -- question list
npm run ai:cli -- question get 9
npm run ai:cli -- question reply 9 --content "Here is the answer"
npm run ai:cli -- question lock 9
npm run ai:cli -- rebuild status
npm run ai:cli -- rebuild log --lines 50
npm run ai:cli -- rebuild trigger
npm run ai:cli -- audit list --limit 20
```

The CLI reads:

- `AI_CLI_KEY`: required shared secret sent as a bearer token
- `AI_CLI_BASE_URL`: optional API origin, defaults to `http://127.0.0.1:4322`
- `AI_CLI_ACTOR_NAME`: optional default author name for AI-generated replies
- `AI_CLI_ACTOR_EMAIL`: optional default author email for AI-generated replies

## Notes

1. Wire custom fonts under `public/fonts/` and update `src/styles/global.css`.
2. Expand content indexing to include projects and tags metadata.
