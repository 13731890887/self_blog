import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { isSystemTag, resolveTagMeta } from '../lib/site-settings';

export const prerender = true;

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://seqiwang.cn');
  const articles = (await getCollection('articles', ({ data }) => !data.draft))
    .sort((left, right) => right.data.pubDate.getTime() - left.data.pubDate.getTime());

  const items = articles.map((article) => {
    const articleUrl = new URL(`/articles/${article.slug}`, base).toString();
    const tags = article.data.tags
      .filter((tag) => !isSystemTag(tag))
      .map((tag) => resolveTagMeta(tag)?.zh ?? tag);

    const categories = tags
      .map((tag) => `    <category>${escapeXml(tag)}</category>`)
      .join('\n');

    return [
      '  <item>',
      `    <title>${escapeXml(article.data.title)}</title>`,
      `    <link>${articleUrl}</link>`,
      `    <guid>${articleUrl}</guid>`,
      `    <pubDate>${article.data.pubDate.toUTCString()}</pubDate>`,
      `    <description>${escapeXml(article.data.description)}</description>`,
      categories,
      '  </item>'
    ]
      .filter(Boolean)
      .join('\n');
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Self Blog</title>
  <link>${new URL('/', base).toString()}</link>
  <description>Self Blog 中文文章 RSS 订阅源</description>
  <language>zh-CN</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  });
};
