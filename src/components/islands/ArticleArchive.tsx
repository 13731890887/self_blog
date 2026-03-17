import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Locale } from '../../lib/i18n';

type ArticleItem = {
  slug: string;
  title: string;
  description: string;
  pubDate: string;
  readingTime: string;
  tags: string[];
};

type TagItem = {
  tag: string;
  label: string;
  count: number;
};

const copy = {
  zh: {
    all: '全部',
    filter: '按标签浏览',
    posts: '篇文章'
  },
  en: {
    all: 'All',
    filter: 'Browse by tag',
    posts: 'posts'
  }
} as const;

function normalizeTag(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isSystemTag(tag: string) {
  const normalized = normalizeTag(tag);
  return normalized === 'note' || normalized === 'notes';
}

export default function ArticleArchive({
  locale,
  articles,
  tags
}: {
  locale: Locale;
  articles: ArticleItem[];
  tags: TagItem[];
}) {
  const text = copy[locale];
  const [activeTag, setActiveTag] = useState<string>('');

  useEffect(() => {
    const initial = new URL(window.location.href).searchParams.get('tag') ?? '';
    setActiveTag(initial);
  }, []);

  const filtered = useMemo(() => (
    activeTag ? articles.filter((article) => article.tags.includes(activeTag)) : articles
  ), [activeTag, articles]);

  function selectTag(tag: string) {
    setActiveTag(tag);
    const url = new URL(window.location.href);
    if (tag) {
      url.searchParams.set('tag', tag);
    } else {
      url.searchParams.delete('tag');
    }
    window.history.replaceState({}, '', url);
  }

  return (
    <div>
      <div class="mt-10 rounded-[1.75rem] border border-border bg-surface p-6">
        <p class="text-xs uppercase tracking-[0.22em] text-secondary">{text.filter}</p>
        <div class="mt-5 flex flex-wrap gap-3">
          <button
            class={activeTag === '' ? activeClass : idleClass}
            onClick={() => selectTag('')}
          >
            {text.all}
          </button>
          {tags.map((item) => (
            <button
              class={activeTag === item.tag ? activeClass : idleClass}
              onClick={() => selectTag(item.tag)}
            >
              {item.label}
              <span class="ml-2 text-muted">{item.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`mt-12 grid gap-8 ${filtered.length === 1 ? 'mx-auto max-w-3xl grid-cols-1' : 'xl:grid-cols-2'}`}>
        {filtered.map((article) => (
          <a href={`${locale === 'zh' ? '' : '/en'}/articles/${article.slug}`} class="panel group block min-h-72 rounded-3xl p-6 transition hover:-translate-y-1 hover:border-primary/70">
            <div class="mb-5 flex flex-wrap gap-2">
              {article.tags.filter((tag) => !isSystemTag(tag)).slice(0, 3).map((tag) => {
                const meta = tags.find((item) => item.tag === tag);
                return <span class="rounded-full border border-border bg-white/3 px-3 py-1 text-xs uppercase tracking-[0.22em] text-muted">{meta?.label ?? tag}</span>;
              })}
            </div>
            <h3 class="font-display text-2xl tracking-tight text-text">{article.title}</h3>
            <p class="mt-3 text-sm leading-7 text-muted">{article.description}</p>
            <div class="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-muted">
              <span>{new Date(article.pubDate).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}</span>
              <span>{article.readingTime}</span>
            </div>
          </a>
        ))}
      </div>
      <p class="mt-6 text-xs uppercase tracking-[0.22em] text-muted">{filtered.length} {text.posts}</p>
    </div>
  );
}

const activeClass = 'rounded-full border border-secondary bg-secondary/12 px-4 py-2 text-sm text-secondary transition';
const idleClass = 'rounded-full border border-border bg-surface-strong px-4 py-2 text-sm text-muted transition hover:border-primary hover:text-text';
