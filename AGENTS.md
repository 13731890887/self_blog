# Repository Guidelines

## Project Structure & Module Organization
This repository is a static-export Next.js 15 blog.

- `src/app/`: App Router pages and route segments (`blog/[slug]`, `reading/[slug]`, `guestbook`, etc.).
- `src/components/`: Reusable UI and integration components (navigation, comments, cards).
- `src/lib/`: Content-loading utilities (`posts.ts`, `books.ts`) that parse MD/MDX frontmatter.
- `src/types/`: Shared TypeScript types.
- `content/posts/` and `content/books/`: Author content in `.md`/`.mdx`.
- `public/`: Static assets.
- Generated outputs: `out/` and `dist/` (do not edit manually).

## Build, Test, and Development Commands
- `npm ci`: Install dependencies (preferred in CI/local clean setup).
- `npm run dev`: Start local development server.
- `npm run build`: Build static output and copy `out/*` into `dist/`.
- `npm run preview`: Build and serve exported site for local verification.
- `npm run lint`: Run Next.js ESLint checks.
- `npm run type-check`: Run TypeScript checks without emit.

Use `npm run lint && npm run type-check && npm run build` before opening a PR.

## Coding Style & Naming Conventions
- Language: TypeScript + React function components.
- Formatting style used in repo: 2-space indentation, semicolons, double quotes.
- Components/pages: `PascalCase` for component files, route folders follow Next.js conventions.
- Utility/type files: lowercase or domain-based naming (`posts.ts`, `book.ts`).
- Keep path aliases via `@/` (configured in `tsconfig.json`).

## Testing Guidelines
No dedicated unit-test framework is configured yet. Treat this minimum verification set as required:

1. `npm run lint`
2. `npm run type-check`
3. `npm run build`
4. Manual smoke test of changed routes in `npm run dev` or `npm run preview`

If you add automated tests, place them near source files and use `*.test.ts` / `*.test.tsx`.

## Commit & Pull Request Guidelines
Recent history favors short, imperative subjects (for example: `Add ...`, `Fix ...`, `Change ...`).

- Keep commit messages concise, present tense, and scoped to one change.
- PRs should include: purpose, key changes, verification steps, and linked issue (if any).
- For UI/content changes, include screenshots or route-level notes (for example `/blog/cloudflare-pages-deploy`).
- Ensure GitHub Actions deployment expectations remain intact for `main`.
