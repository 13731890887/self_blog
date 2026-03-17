import test from 'node:test';
import assert from 'node:assert/strict';
import { createSlug, publishArticle } from '../src/lib/content.js';
import fs from 'node:fs';
import path from 'node:path';
import { fromProjectRoot } from '../src/lib/paths.js';

test('createSlug normalizes mixed input into a safe slug', () => {
  assert.equal(createSlug('  Hello, AI Workflow!  '), 'hello-ai-workflow');
});

test('publishArticle serializes numeric-looking strings as YAML strings', () => {
  const title = `123-${Date.now()}`;
  const result = publishArticle({
    title,
    content: '123',
    metaDescription: '123',
    tags: ['456'],
    tldr: '789',
    draft: true
  });

  const filePath = path.join(fromProjectRoot('src', 'content', 'articles'), `${result.slug}.mdx`);
  const source = fs.readFileSync(filePath, 'utf8');

  assert.match(source, new RegExp(`title: "${title}"`));
  assert.match(source, /description: "123"/);
  assert.match(source, /- "456"/);
  assert.match(source, /tldr: "789"/);

  fs.unlinkSync(filePath);
});

test('publishArticle falls back to note tag when tags are empty', () => {
  const title = `empty-tags-${Date.now()}`;
  const result = publishArticle({
    title,
    content: 'A short body for tag fallback.',
    tags: [],
    draft: true
  });

  const filePath = path.join(fromProjectRoot('src', 'content', 'articles'), `${result.slug}.mdx`);
  const source = fs.readFileSync(filePath, 'utf8');

  assert.match(source, /- "note"/);

  fs.unlinkSync(filePath);
});
