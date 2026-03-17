import fs from 'node:fs';
import path from 'node:path';
import { fromProjectRoot } from './paths.js';
import { isSystemTag, normalizeTag } from './site-settings.js';

type PublishInput = {
  title: string;
  content: string;
  metaDescription?: string;
  tags?: string[];
  tldr?: string;
  draft: boolean;
};

const articlesDir = fromProjectRoot('src', 'content', 'articles');

export function publishArticle(input: PublishInput) {
  fs.mkdirSync(articlesDir, { recursive: true });

  const slug = createSlug(input.title);
  const filePath = path.join(articlesDir, `${slug}.mdx`);

  if (fs.existsSync(filePath)) {
    throw new Error('An article with the same slug already exists');
  }

  const source = buildMdxSource({
    ...input,
    slug
  });

  fs.writeFileSync(filePath, source, 'utf8');

  return {
    slug,
    filePath,
    href: `/articles/${slug}`
  };
}

export function createSlug(value: string) {
  const ascii = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return ascii || `note-${Date.now()}`;
}

function buildMdxSource(input: PublishInput & { slug: string }) {
  const content = normalizeMarkdownContent(input.content);
  const description = input.metaDescription?.trim() || summarizeContent(content);
  const normalizedTags = [...new Set((input.tags ?? []).map((tag) => normalizeTag(tag)).filter(Boolean))];
  const businessTags = normalizedTags.filter((tag) => !isSystemTag(tag));
  const tags = (businessTags.length > 0 ? businessTags : ['note']).slice(0, 6);
  const readingTime = estimateReadingTime(content);

  return [
    '---',
    `title: ${toYamlString(input.title)}`,
    `description: ${toYamlString(description)}`,
    `pubDate: ${new Date().toISOString().slice(0, 10)}`,
    'tags:',
    ...tags.map((tag) => `  - ${toYamlString(tag)}`),
    `readingTime: ${toYamlString(readingTime)}`,
    `draft: ${input.draft ? 'true' : 'false'}`,
    ...(input.tldr?.trim() ? [`tldr: ${toYamlString(input.tldr.trim())}`] : []),
    '---',
    '',
    content,
    ''
  ].join('\n');
}

function summarizeContent(content: string) {
  return stripMarkdown(content)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140) || 'Draft article';
}

function estimateReadingTime(content: string) {
  const wordCount = stripMarkdown(content).trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / 220));
  return `${minutes} min read`;
}

function toYamlString(value: string) {
  return JSON.stringify(value);
}

function normalizeMarkdownContent(content: string) {
  return content
    .replace(/\r\n/g, '\n')
    .trim()
    .replace(/\n{3,}/g, '\n\n');
}

function stripMarkdown(content: string) {
  return content
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1 ')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>#-]+/g, ' ');
}
