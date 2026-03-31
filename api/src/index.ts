import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import ai from './routes/ai.js';
import admin from './routes/admin.js';
import cli from './routes/cli.js';
import search from './routes/search.js';
import comments from './routes/comments.js';
import questions from './routes/questions.js';
import views from './routes/views.js';
import { initializeDatabase } from './db/init.js';
import { loadEnvironment } from './lib/env.js';

loadEnvironment();
const app = new Hono();
initializeDatabase();

app.get('/health', (c) => c.json({ ok: true }));
app.route('/api/admin', admin);
app.route('/api/cli', cli);
app.route('/api/ai', ai);
app.route('/api/comments', comments);
app.route('/api/questions', questions);
app.route('/api/search', search);
app.route('/api/views', views);

const port = Number(process.env.PORT ?? 4322);

serve({
  fetch: app.fetch,
  port
});

console.log(`API server listening on http://localhost:${port}`);
