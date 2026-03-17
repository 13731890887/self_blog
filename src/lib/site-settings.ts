import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CollectionEntry } from 'astro:content';
import type { Locale } from './i18n';

export type SiteSettings = {
  hero: {
    zh: {
      title: string;
      description: string;
    };
    en: {
      title: string;
      description: string;
    };
  };
  tags: Array<{
    zh: string;
    en: string;
  }>;
};

const currentFile = fileURLToPath(import.meta.url);
const srcDir = path.dirname(path.dirname(currentFile));
const projectRoot = path.dirname(srcDir);
const settingsPath = path.join(projectRoot, 'src', 'data', 'site-settings.json');

const fallbackSettings: SiteSettings = {
  hero: {
    zh: {
      title: '先把问题问对',
      description: '慢一点，把复杂的事想明白。'
    },
    en: {
      title: 'Start by asking the right question',
      description: 'Slow down and make the complicated parts legible.'
    }
  },
  tags: [
    { zh: '笔记', en: 'note' }
  ]
};

export function readSiteSettings(): SiteSettings {
  try {
    const source = fs.readFileSync(settingsPath, 'utf8');
    return JSON.parse(source) as SiteSettings;
  } catch {
    return fallbackSettings;
  }
}

export function getHeroCopy(locale: Locale) {
  return readSiteSettings().hero[locale];
}

export function normalizeTag(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isSystemTag(tag: string) {
  const normalized = normalizeTag(tag);
  return normalized === 'note' || normalized === 'notes';
}

export function resolveTagMeta(tag: string) {
  const normalized = normalizeTag(tag);
  return readSiteSettings().tags.find((item) => normalizeTag(item.en) === normalized);
}

export function getAvailableTags() {
  return readSiteSettings().tags
    .map((item) => ({
      zh: item.zh.trim(),
      en: normalizeTag(item.en)
    }))
    .filter((item) => item.zh && item.en);
}

export function buildTagList(
  articles: CollectionEntry<'articles'>[],
  locale: Locale
) {
  const counts = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.data.tags) {
      const normalized = normalizeTag(tag);
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }
  }

  const knownTags = getAvailableTags();
  const result = knownTags
    .map((tag) => ({
      tag: tag.en,
      label: locale === 'zh' ? tag.zh : tag.en,
      count: counts.get(tag.en) ?? 0
    }))
    .filter((item) => item.count > 0 && !isSystemTag(item.tag))
    .sort((left, right) => left.label.localeCompare(right.label));

  for (const [tag, count] of counts.entries()) {
    if (result.some((item) => item.tag === tag) || isSystemTag(tag)) {
      continue;
    }

    result.push({
      tag,
      label: tag,
      count
    });
  }

  return result.sort((left, right) => left.label.localeCompare(right.label));
}
