import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { Hono } from 'hono';
import cli from '../src/routes/cli.js';
import { fromProjectRoot } from '../src/lib/paths.js';
import { initializeDatabase } from '../src/db/init.js';
import { db } from '../src/db/client.js';

function createApp() {
  const app = new Hono();
  app.route('/api/cli', cli);
  return app;
}

function authHeaders(extra?: Record<string, string>) {
  return {
    authorization: 'Bearer test-cli-key',
    ...extra
  };
}

initializeDatabase();

test('cli route rejects requests without key', async () => {
  process.env.AI_CLI_KEY = 'test-cli-key';
  const app = createApp();
  const response = await app.request('/api/cli/articles');

  assert.equal(response.status, 401);
});

test('cli route can publish and partially update an article with bearer auth', async () => {
  process.env.AI_CLI_KEY = 'test-cli-key';
  const app = createApp();
  const title = `cli-route-${Date.now()}`;

  const publishResponse = await app.request('/api/cli/articles', {
    method: 'POST',
    headers: {
      authorization: 'Bearer test-cli-key',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      title,
      content: 'Initial body',
      tags: ['cli'],
      draft: true
    })
  });

  assert.equal(publishResponse.status, 200);
  const published = await publishResponse.json();
  assert.equal(published.ok, true);

  const updateResponse = await app.request(`/api/cli/articles/${published.slug}`, {
    method: 'PUT',
    headers: {
      authorization: 'Bearer test-cli-key',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      content: 'Updated body',
      tags: ['cli', 'updated']
    })
  });

  assert.equal(updateResponse.status, 200);

  const articlePath = path.join(fromProjectRoot('src', 'content', 'articles'), `${published.slug}.mdx`);
  const source = fs.readFileSync(articlePath, 'utf8');
  assert.match(source, /title: "cli-route-/);
  assert.match(source, /Updated body/);
  assert.match(source, /- "updated"/);

  fs.unlinkSync(articlePath);
});

test('cli route can rename an article and generate a diff preview', async () => {
  process.env.AI_CLI_KEY = 'test-cli-key';
  const app = createApp();
  const title = `cli-rename-${Date.now()}`;

  const publishResponse = await app.request('/api/cli/articles', {
    method: 'POST',
    headers: authHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify({
      title,
      content: 'Original body',
      tags: ['cli'],
      draft: true
    })
  });

  const published = await publishResponse.json();
  const diffResponse = await app.request(`/api/cli/articles/${published.slug}/diff`, {
    method: 'POST',
    headers: authHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify({
      content: 'Changed body'
    })
  });

  assert.equal(diffResponse.status, 200);
  const diffPayload = await diffResponse.json();
  assert.equal(diffPayload.changed, true);
  assert.match(diffPayload.diff, /Changed body/);

  const renameResponse = await app.request(`/api/cli/articles/${published.slug}/rename`, {
    method: 'POST',
    headers: authHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify({
      to: `${published.slug}-renamed`
    })
  });

  assert.equal(renameResponse.status, 200);
  const renamed = await renameResponse.json();
  assert.equal(renamed.slug, `${published.slug}-renamed`);

  const renamedPath = path.join(fromProjectRoot('src', 'content', 'articles'), `${renamed.slug}.mdx`);
  assert.equal(fs.existsSync(renamedPath), true);
  fs.unlinkSync(renamedPath);
});

test('cli route can read and write site settings', async () => {
  process.env.AI_CLI_KEY = 'test-cli-key';
  const app = createApp();
  const settingsPath = fromProjectRoot('src', 'data', 'site-settings.json');
  const originalSettings = fs.readFileSync(settingsPath, 'utf8');

  try {
    const getResponse = await app.request('/api/cli/settings', {
      headers: authHeaders()
    });
    assert.equal(getResponse.status, 200);

    const nextSettings = {
      hero: {
        zh: {
          title: '新的标题',
          description: '新的描述'
        },
        en: {
          title: 'New title',
          description: 'New description'
        }
      },
      tags: [
        { zh: '笔记', en: 'note-custom' },
        { zh: 'AI', en: 'ai' }
      ]
    };

    const setResponse = await app.request('/api/cli/settings', {
      method: 'PUT',
      headers: authHeaders({ 'content-type': 'application/json' }),
      body: JSON.stringify(nextSettings)
    });

    assert.equal(setResponse.status, 200);
    const payload = await setResponse.json();
    assert.equal(payload.ok, true);
    assert.equal(payload.settings.hero.zh.title, '新的标题');
    assert.equal(payload.settings.tags[1].en, 'ai');
  } finally {
    fs.writeFileSync(settingsPath, originalSettings, 'utf8');
  }
});

test('cli route can upload an image asset', async () => {
  process.env.AI_CLI_KEY = 'test-cli-key';
  const app = createApp();
  const form = new FormData();
  const pngBytes = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
  form.set('image', new File([pngBytes], 'cover.png', { type: 'image/png' }));
  form.set('alt', 'cover');

  const response = await app.request('/api/cli/assets/upload-image', {
    method: 'POST',
    headers: authHeaders(),
    body: form
  });

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.ok, true);
  assert.match(payload.url, /^\/uploads\/.+\.png\?v=/);
  assert.match(payload.markdown, /^!\[cover\]\(\/uploads\//);

  const savedPath = path.join(fromProjectRoot('public'), payload.url.replace(/^\/+/, '').split('?')[0]);
  assert.equal(fs.existsSync(savedPath), true);

  const listResponse = await app.request('/api/cli/assets', {
    headers: authHeaders()
  });
  assert.equal(listResponse.status, 200);
  const listPayload = await listResponse.json();
  assert.ok(listPayload.assets.some((item: { filename: string }) => item.filename === payload.filename));

  const deleteResponse = await app.request(`/api/cli/assets/${encodeURIComponent(payload.filename)}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  assert.equal(deleteResponse.status, 200);
  assert.equal(fs.existsSync(savedPath), false);
});

test('cli route can import a docx document', async () => {
  process.env.AI_CLI_KEY = 'test-cli-key';
  const app = createApp();
  const docxPath = createMinimalDocx(`cli-doc-${Date.now()}`);
  const form = new FormData();
  form.set('document', new File([fs.readFileSync(docxPath)], path.basename(docxPath), {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }));

  const response = await app.request('/api/cli/articles/import-docx', {
    method: 'POST',
    headers: authHeaders(),
    body: form
  });

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.match(payload.title, /cli doc/);
  assert.match(payload.content, /Hello from docx/);

  fs.unlinkSync(docxPath);
});

test('cli route exposes status and rebuild status', async () => {
  process.env.AI_CLI_KEY = 'test-cli-key';
  const app = createApp();

  const statusResponse = await app.request('/api/cli/status', {
    headers: authHeaders()
  });
  const rebuildResponse = await app.request('/api/cli/rebuild/status', {
    headers: authHeaders()
  });

  assert.equal(statusResponse.status, 200);
  assert.equal(rebuildResponse.status, 200);

  const status = await statusResponse.json();
  const rebuild = await rebuildResponse.json();
  assert.equal(status.ok, true);
  assert.ok(status.capabilities.article.includes('rename'));
  assert.ok(status.capabilities.asset.includes('delete'));
  assert.equal(typeof rebuild.running, 'boolean');
});

test('cli route can manage settings tags', async () => {
  process.env.AI_CLI_KEY = 'test-cli-key';
  const app = createApp();
  const settingsPath = fromProjectRoot('src', 'data', 'site-settings.json');
  const originalSettings = fs.readFileSync(settingsPath, 'utf8');

  try {
    const addResponse = await app.request('/api/cli/settings/tags', {
      method: 'POST',
      headers: authHeaders({ 'content-type': 'application/json' }),
      body: JSON.stringify({
        zh: '新增标签',
        en: 'new-tag'
      })
    });

    assert.equal(addResponse.status, 200);
    const listResponse = await app.request('/api/cli/settings/tags', {
      headers: authHeaders()
    });
    const listPayload = await listResponse.json();
    assert.ok(listPayload.tags.some((item: { en: string }) => item.en === 'new-tag'));

    const removeResponse = await app.request('/api/cli/settings/tags/new-tag', {
      method: 'DELETE',
      headers: authHeaders()
    });
    assert.equal(removeResponse.status, 200);
  } finally {
    fs.writeFileSync(settingsPath, originalSettings, 'utf8');
  }
});

test('cli route can manage comments and questions', async () => {
  process.env.AI_CLI_KEY = 'test-cli-key';
  const app = createApp();

  const comment = db.prepare(`
    INSERT INTO article_comments(article_slug, username, email, email_normalized, ip_hash, content)
    VALUES ('hello-agent', 'seqi', 'cli@example.com', 'cli@example.com', 'ip-hash', 'CLI comment')
  `).run();

  const question = db.prepare(`
    INSERT INTO question_threads(slug, username, email, email_normalized, ip_hash, title, content)
    VALUES ('cli-question-${Date.now()}', 'seqi', 'cli@example.com', 'cli@example.com', 'ip-hash', 'CLI question', 'Question body long enough')
  `).run();

  const commentsResponse = await app.request('/api/cli/comments', {
    headers: authHeaders()
  });
  const questionsResponse = await app.request('/api/cli/questions', {
    headers: authHeaders()
  });

  assert.equal(commentsResponse.status, 200);
  assert.equal(questionsResponse.status, 200);

  const commentsPayload = await commentsResponse.json();
  const questionsPayload = await questionsResponse.json();
  assert.ok(commentsPayload.comments.some((item: { id: number }) => item.id === Number(comment.lastInsertRowid)));
  assert.ok(questionsPayload.questions.some((item: { id: number }) => item.id === Number(question.lastInsertRowid)));

  const commentGet = await app.request(`/api/cli/comments/${comment.lastInsertRowid}`, {
    headers: authHeaders()
  });
  const questionGet = await app.request(`/api/cli/questions/${question.lastInsertRowid}`, {
    headers: authHeaders()
  });
  assert.equal(commentGet.status, 200);
  assert.equal(questionGet.status, 200);

  const replyCommentResponse = await app.request(`/api/cli/comments/${comment.lastInsertRowid}/reply`, {
    method: 'POST',
    headers: authHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify({ content: 'Admin comment reply' })
  });
  const replyQuestionResponse = await app.request(`/api/cli/questions/${question.lastInsertRowid}/reply`, {
    method: 'POST',
    headers: authHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify({ content: 'Admin question reply' })
  });
  assert.equal(replyCommentResponse.status, 200);
  assert.equal(replyQuestionResponse.status, 200);

  const questionReply = await replyQuestionResponse.json();
  const nestedReplyResponse = await app.request(`/api/cli/questions/replies/${questionReply.id}/reply`, {
    method: 'POST',
    headers: authHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify({ content: 'Nested admin reply' })
  });
  assert.equal(nestedReplyResponse.status, 200);

  const hideCommentResponse = await app.request(`/api/cli/comments/${comment.lastInsertRowid}/hide`, {
    method: 'POST',
    headers: authHeaders()
  });
  const restoreCommentResponse = await app.request(`/api/cli/comments/${comment.lastInsertRowid}/restore`, {
    method: 'POST',
    headers: authHeaders()
  });
  const lockQuestionResponse = await app.request(`/api/cli/questions/${question.lastInsertRowid}/lock`, {
    method: 'POST',
    headers: authHeaders()
  });
  const deleteQuestionResponse = await app.request(`/api/cli/questions/${question.lastInsertRowid}/delete`, {
    method: 'POST',
    headers: authHeaders()
  });

  assert.equal(hideCommentResponse.status, 200);
  assert.equal(restoreCommentResponse.status, 200);
  assert.equal(lockQuestionResponse.status, 200);
  assert.equal(deleteQuestionResponse.status, 200);

  const commentStatus = db.prepare('SELECT status FROM article_comments WHERE id = ?').get(comment.lastInsertRowid) as { status: string };
  const questionStatus = db.prepare('SELECT status, locked FROM question_threads WHERE id = ?').get(question.lastInsertRowid) as { status: string; locked: number };
  assert.equal(commentStatus.status, 'visible');
  assert.equal(questionStatus.status, 'deleted');
  assert.equal(questionStatus.locked, 1);
});

test('cli route exposes rebuild log and audit events', async () => {
  process.env.AI_CLI_KEY = 'test-cli-key';
  const app = createApp();
  const logPath = fromProjectRoot('shared', 'site-rebuild.log');
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.writeFileSync(logPath, 'line-1\nline-2\nline-3\n', 'utf8');

  db.prepare(`
    INSERT INTO moderation_events(target_type, target_id, action, reason)
    VALUES ('comments', 1, 'delete', 'test')
  `).run();

  const rebuildLogResponse = await app.request('/api/cli/rebuild/log?lines=2', {
    headers: authHeaders()
  });
  const auditResponse = await app.request('/api/cli/audit?limit=10&targetType=comments', {
    headers: authHeaders()
  });

  assert.equal(rebuildLogResponse.status, 200);
  assert.equal(auditResponse.status, 200);

  const rebuildLog = await rebuildLogResponse.json();
  const audit = await auditResponse.json();
  assert.deepEqual(rebuildLog.lines, ['line-2', 'line-3']);
  assert.ok(audit.events.some((item: { target_type: string; action: string }) => item.target_type === 'comments' && item.action === 'delete'));
});

function createMinimalDocx(filenameStem: string) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'self-blog-docx-'));
  const docxPath = path.join(tempDir, `${filenameStem}.docx`);

  fs.mkdirSync(path.join(tempDir, '_rels'));
  fs.mkdirSync(path.join(tempDir, 'word'));

  fs.writeFileSync(path.join(tempDir, '[Content_Types].xml'), [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
    '<Default Extension="xml" ContentType="application/xml"/>',
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>',
    '</Types>'
  ].join(''));

  fs.writeFileSync(path.join(tempDir, '_rels', '.rels'), [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>',
    '</Relationships>'
  ].join(''));

  fs.writeFileSync(path.join(tempDir, 'word', 'document.xml'), [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
    '<w:body>',
    `<w:p><w:r><w:t>${filenameStem.replace(/-/g, ' ')}</w:t></w:r></w:p>`,
    '<w:p><w:r><w:t>Hello from docx</w:t></w:r></w:p>',
    '</w:body>',
    '</w:document>'
  ].join(''));

  execFileSync('zip', ['-qr', docxPath, '[Content_Types].xml', '_rels', 'word'], {
    cwd: tempDir
  });

  return docxPath;
}
