import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { db } from '../db/client.js';
import { createBailianStream, generateMoodOfDay, hasBailianConfig } from '../lib/bailian.js';
import { consumeSseBuffer } from '../lib/sse.js';

const ai = new Hono();

ai.get('/mood', async (c) => {
  const today = new Date().toISOString().slice(0, 10);
  const existing = db.prepare('SELECT color, label, rationale FROM daily_moods WHERE day = ?').get(today) as
    | { color: string; label: string; rationale: string | null }
    | undefined;

  if (existing) {
    return c.json(existing);
  }

  if (!hasBailianConfig()) {
    return c.json({
      color: '#00D9C0',
      label: 'lucid',
      rationale: 'BAILIAN_API_KEY is not configured'
    });
  }

  try {
    const mood = await generateMoodOfDay();
    db.prepare(`
      INSERT INTO daily_moods (day, color, label, rationale)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(day) DO UPDATE SET
        color = excluded.color,
        label = excluded.label,
        rationale = excluded.rationale
    `).run(today, mood.color, mood.label, mood.rationale);

    return c.json(mood);
  } catch (error) {
    console.error('Mood generation failed:', error);
    return c.json({
      color: '#00D9C0',
      label: 'lucid',
      rationale: 'Fell back because Bailian request failed'
    }, 502);
  }
});

ai.post('/chat', async (c) => {
  const body = await c.req.json().catch(() => ({ message: '', slug: '' }));
  const prompt = typeof body.message === 'string' ? body.message.trim() : '';
  const slug = typeof body.slug === 'string' ? body.slug : '';

  if (!prompt) {
    return c.json({ error: 'message is required' }, 400);
  }

  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');

  return streamSSE(c, async (stream) => {
    if (!hasBailianConfig()) {
      await stream.writeSSE({
        data: 'BAILIAN_API_KEY is not configured. Add it to enable Alibaba Bailian streaming responses.'
      });
      return;
    }

    try {
      const article = slug
        ? db.prepare('SELECT title, body, summary FROM articles WHERE slug = ?').get(slug) as
            | { title: string; body: string; summary: string | null }
            | undefined
        : undefined;

      const upstream = await createBailianStream([
        {
          role: 'system',
          content:
            'You are the article companion for a personal blog. Be concise, technically precise, and answer in the user language.'
        },
        {
          role: 'user',
          content: buildPrompt(prompt, article)
        }
      ]);

      const reader = upstream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
        const parsed = consumeSseBuffer(buffer, done);
        buffer = parsed.remainder;

        for (const line of parsed.events) {
          if (line === '[DONE]') continue;
          const payload = safeParse(line);
          const delta = payload?.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta.length > 0) {
            await stream.writeSSE({ data: delta });
          }
        }

        if (done) break;
      }
    } catch (error) {
      console.error('Bailian streaming failed:', error);
      await stream.writeSSE({
        event: 'error',
        data: 'Bailian streaming request failed'
      });
    }
  });
});

export default ai;

function buildPrompt(prompt: string, article?: { title: string; body: string; summary: string | null }) {
  if (!article) {
    return prompt;
  }

  return [
    `Article title: ${article.title}`,
    article.summary ? `Article summary: ${article.summary}` : '',
    `Article body:\n${article.body.slice(0, 8000)}`,
    `User question: ${prompt}`
  ].filter(Boolean).join('\n\n');
}

function safeParse(payload: string) {
  try {
    return JSON.parse(payload) as {
      choices?: Array<{ delta?: { content?: string } }>;
    };
  } catch {
    return null;
  }
}
