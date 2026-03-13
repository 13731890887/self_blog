import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAdminSessionToken,
  verifyAdminPassword,
  verifyAdminSessionToken
} from '../src/lib/admin-auth.js';

test('verifyAdminPassword checks configured password', () => {
  process.env.ADMIN_PASSWORD = 'secret-pass';
  assert.equal(verifyAdminPassword('secret-pass'), true);
  assert.equal(verifyAdminPassword('wrong'), false);
});

test('createAdminSessionToken creates a verifiable token', () => {
  process.env.ADMIN_SESSION_SECRET = 'super-secret';
  const now = Date.now();
  const token = createAdminSessionToken(now);
  assert.equal(verifyAdminSessionToken(token, now + 1000), true);
  assert.equal(verifyAdminSessionToken(token, now + 1000 * 60 * 60 * 24), false);
});
