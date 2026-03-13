import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import ai from './routes/ai.js';
import search from './routes/search.js';
import views from './routes/views.js';

const app = new Hono();

app.get('/health', (c) => c.json({ ok: true }));
app.route('/api/ai', ai);
app.route('/api/search', search);
app.route('/api/views', views);

const port = Number(process.env.PORT ?? 4321);

serve({
  fetch: app.fetch,
  port
});

console.log(`API server listening on http://localhost:${port}`);
