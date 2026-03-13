import { Hono } from 'hono';

const views = new Hono();

views.get('/', (c) => {
  const slug = c.req.query('slug') ?? 'unknown';
  const seed = [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return c.json({
    slug,
    views: 120 + (seed % 800)
  });
});

export default views;
