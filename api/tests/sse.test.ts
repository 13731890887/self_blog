import test from 'node:test';
import assert from 'node:assert/strict';
import { consumeSseBuffer } from '../src/lib/sse.js';

test('consumeSseBuffer returns complete events and keeps partial remainder', () => {
  const parsed = consumeSseBuffer('data: hello\n\ndata: wor');
  assert.deepEqual(parsed.events, ['hello']);
  assert.equal(parsed.remainder, 'data: wor');
});

test('consumeSseBuffer flushes trailing event on stream completion', () => {
  const parsed = consumeSseBuffer('data: final chunk', true);
  assert.deepEqual(parsed.events, ['final chunk']);
  assert.equal(parsed.remainder, '');
});
