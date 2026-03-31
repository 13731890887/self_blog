import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
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

type UpdateInput = PublishInput & {
  slug: string;
};

const articlesDir = fromProjectRoot('src', 'content', 'articles');

export type ArticleListItem = {
  slug: string;
  title: string;
  description: string;
  pubDate: string;
  draft: boolean;
  filePath: string;
};

export type ArticleDetail = ArticleListItem & {
  content: string;
  tags: string[];
  tldr: string;
};

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

export function listArticles(): ArticleListItem[] {
  fs.mkdirSync(articlesDir, { recursive: true });

  return fs.readdirSync(articlesDir)
    .filter((name) => name.endsWith('.mdx'))
    .map((name) => {
      const filePath = path.join(articlesDir, name);
      const source = fs.readFileSync(filePath, 'utf8');
      const parsed = matter(source);
      const slug = name.replace(/\.mdx$/, '');
      const pubDate = typeof parsed.data.pubDate === 'string' ? parsed.data.pubDate : '';

      return {
        slug,
        title: typeof parsed.data.title === 'string' ? parsed.data.title : slug,
        description: typeof parsed.data.description === 'string' ? parsed.data.description : '',
        pubDate,
        draft: parsed.data.draft === true,
        filePath
      };
    })
    .sort((a, b) => compareDates(b.pubDate, a.pubDate) || a.slug.localeCompare(b.slug));
}

export function deleteArticle(slug: string) {
  const filePath = path.join(articlesDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    throw new Error('Article not found');
  }

  const source = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(source);
  fs.unlinkSync(filePath);

  return {
    slug,
    draft: parsed.data.draft === true
  };
}

export function getArticle(slug: string): ArticleDetail {
  const filePath = path.join(articlesDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    throw new Error('Article not found');
  }

  const source = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(source);
  const pubDate = typeof parsed.data.pubDate === 'string' ? parsed.data.pubDate : '';

  return {
    slug,
    title: typeof parsed.data.title === 'string' ? parsed.data.title : slug,
    description: typeof parsed.data.description === 'string' ? parsed.data.description : '',
    pubDate,
    draft: parsed.data.draft === true,
    filePath,
    content: typeof parsed.content === 'string' ? parsed.content.trim() : '',
    tags: Array.isArray(parsed.data.tags) ? parsed.data.tags.filter((tag) => typeof tag === 'string') : [],
    tldr: typeof parsed.data.tldr === 'string' ? parsed.data.tldr : ''
  };
}

export function updateArticle(input: UpdateInput) {
  const existing = getArticle(input.slug);
  const source = buildMdxSource({
    ...input,
    slug: existing.slug,
    pubDate: existing.pubDate || new Date().toISOString().slice(0, 10)
  });

  fs.writeFileSync(existing.filePath, source, 'utf8');

  return {
    slug: existing.slug,
    filePath: existing.filePath,
    href: `/articles/${existing.slug}`
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

function buildMdxSource(input: PublishInput & { slug: string; pubDate?: string }) {
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
    `pubDate: ${input.pubDate || new Date().toISOString().slice(0, 10)}`,
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

function compareDates(left: string, right: string) {
  const leftTime = Date.parse(left);
  const rightTime = Date.parse(right);

  if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) {
    return 0;
  }
  if (Number.isNaN(leftTime)) {
    return -1;
  }
  if (Number.isNaN(rightTime)) {
    return 1;
  }

  return leftTime - rightTime;
}
