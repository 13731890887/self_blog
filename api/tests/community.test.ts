import test from 'node:test';
import assert from 'node:assert/strict';
import { createThreadSlug, normalizeEmail, validateCommunityPayload } from '../src/lib/community.js';

test('normalizeEmail lowercases and trims email', () => {
  assert.equal(normalizeEmail(' Test@Example.COM '), 'test@example.com');
});

test('validateCommunityPayload accepts a valid comment', () => {
  const result = validateCommunityPayload({
    username: 'seqi',
    email: 'test@example.com',
    content: 'This is a thoughtful comment.',
    website: ''
  }, 'comment');

  assert.equal(result.ok, true);
});

test('createThreadSlug creates a stable slug', () => {
  assert.equal(createThreadSlug('How should I design a comment system?'), 'how-should-i-design-a-comment-system');
});
