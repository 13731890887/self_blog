import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTag, sanitizeSiteSettings } from '../src/lib/site-settings.js';

test('normalizeTag converts loose input into a stable tag slug', () => {
  assert.equal(normalizeTag(' AI Workflow '), 'ai-workflow');
  assert.equal(normalizeTag('Note_01'), 'note-01');
});

test('sanitizeSiteSettings trims fields and keeps only valid tag entries', () => {
  const sanitized = sanitizeSiteSettings({
    hero: {
      zh: {
        title: '  先把问题问对  ',
        description: '  慢一点，把复杂的事想明白。  '
      },
      en: {
        title: '  Ask the right question  ',
        description: '  Make the complex parts legible.  '
      }
    },
    tags: [
      {
        zh: ' 笔记 ',
        en: ' Notes '
      },
      {
        zh: '',
        en: 'bad'
      },
      'invalid'
    ]
  });

  assert.equal(sanitized.hero.zh.title, '先把问题问对');
  assert.deepEqual(sanitized.tags, [{ zh: '笔记', en: 'notes' }]);
});
