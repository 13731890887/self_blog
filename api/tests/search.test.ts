import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFtsQuery, normalizeSearchLimit } from '../src/lib/search.js';

test('buildFtsQuery removes punctuation that breaks FTS parsing', () => {
  assert.equal(buildFtsQuery('c++ site:astro (guide)'), 'c* OR site* OR astro* OR guide*');
});

test('buildFtsQuery returns empty string when query has no searchable terms', () => {
  assert.equal(buildFtsQuery('++ -- :::'), '');
});

test('normalizeSearchLimit clamps invalid and out-of-range values', () => {
  assert.equal(normalizeSearchLimit(undefined), 8);
  assert.equal(normalizeSearchLimit('abc'), 8);
  assert.equal(normalizeSearchLimit('-4'), 1);
  assert.equal(normalizeSearchLimit('99'), 20);
  assert.equal(normalizeSearchLimit('7.9'), 7);
});
