import { Hono } from 'hono';

const search = new Hono();

search.get('/', (c) => {
  const q = c.req.query('q') ?? '';

  return c.json({
    mode: q ? 'fts-fallback' : 'semantic-placeholder',
    query: q,
    results: [
      {
        title: 'Bandwidth-First Architecture',
        href: '/articles/bandwidth-first-architecture',
        score: 0.93
      }
    ]
  });
});

export default search;
