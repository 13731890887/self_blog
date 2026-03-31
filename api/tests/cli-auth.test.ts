import test from 'node:test';
import assert from 'node:assert/strict';
import { extractAiCliKey, verifyAiCliKey } from '../src/lib/cli-auth.js';

test('extractAiCliKey prefers bearer token', () => {
  assert.equal(extractAiCliKey('Bearer secret-key', 'header-key'), 'secret-key');
});

test('verifyAiCliKey checks configured key with constant-length comparison', () => {
  process.env.AI_CLI_KEY = 'shared-secret';
  assert.equal(verifyAiCliKey('shared-secret'), true);
  assert.equal(verifyAiCliKey('wrong-secret'), false);
  assert.equal(verifyAiCliKey(undefined), false);
});
