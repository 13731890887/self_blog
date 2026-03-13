import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';

const ai = new Hono();

ai.get('/mood', (c) => {
  return c.json({
    color: '#00D9C0',
    label: 'lucid'
  });
});

ai.post('/chat', async (c) => {
  const body = await c.req.json().catch(() => ({ message: '' }));
  const prompt = typeof body.message === 'string' ? body.message : '';

  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');

  return streamSSE(c, async (stream) => {
    const chunks = [
      'This is the API scaffold for the article companion.',
      `Prompt received: ${prompt || 'empty prompt'}.`,
      'Replace this generator with Claude Haiku streaming in the next implementation pass.'
    ];

    for (const chunk of chunks) {
      await stream.writeSSE({ data: chunk });
      await stream.sleep(180);
    }
  });
});

export default ai;
