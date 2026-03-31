import test from 'node:test';
import assert from 'node:assert/strict';
import { createSlug, deleteArticle, listArticles, publishArticle } from '../src/lib/content.js';
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

test('listArticles returns saved article metadata', () => {
  const title = `list-article-${Date.now()}`;
  const result = publishArticle({
    title,
    content: 'List me',
    metaDescription: 'Listed article',
    tags: ['alpha'],
    draft: false
  });

  const articles = listArticles();
  const article = articles.find((item) => item.slug === result.slug);

  assert.ok(article);
  assert.equal(article?.title, title);
  assert.equal(article?.draft, false);

  fs.unlinkSync(path.join(fromProjectRoot('src', 'content', 'articles'), `${result.slug}.mdx`));
});

test('deleteArticle removes an article file and returns draft flag', () => {
  const title = `delete-article-${Date.now()}`;
  const result = publishArticle({
    title,
    content: 'Delete me',
    tags: ['alpha'],
    draft: true
  });

  const filePath = path.join(fromProjectRoot('src', 'content', 'articles'), `${result.slug}.mdx`);
  const deleted = deleteArticle(result.slug);

  assert.equal(deleted.slug, result.slug);
  assert.equal(deleted.draft, true);
  assert.equal(fs.existsSync(filePath), false);
});
