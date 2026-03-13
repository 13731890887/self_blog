import { useEffect, useState } from 'preact/hooks';
import type { Locale } from '../../lib/i18n';

type Result = {
  title: string;
  href: string;
  excerpt: string;
  source?: 'local' | 'brave';
  score?: number;
};

const copy = {
  zh: {
    button: '搜索',
    placeholder: '按主题、概念或短语搜索',
    close: '关闭',
    searching: '搜索中...',
    empty: '没有找到结果',
    searchHint: '输入后会实时调用站内搜索，必要时补充 Brave Search 结果',
    localSource: '站内',
    braveSource: '外部',
    error: '搜索请求失败'
  },
  en: {
    button: 'Search',
    placeholder: 'Search by topic, concept, or phrase',
    close: 'Close',
    searching: 'Searching...',
    empty: 'No results found',
    searchHint: 'Search queries hit local content first, then optionally supplement with Brave Search',
    localSource: 'Local',
    braveSource: 'Web',
    error: 'Search request failed'
  }
} as const;

export default function SearchModal({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const text = copy[locale];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setError('');
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`search failed with ${response.status}`);
        }

        const data = await response.json() as { results?: Result[] };
        const nextResults = (data.results ?? []).map((item) => ({
          ...item,
          href: localizeHref(item.href, item.source, locale)
        }));
        setResults(nextResults);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          console.error(requestError);
          setResults([]);
          setError(text.error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [locale, open, query, text.error]);

  if (!open) {
    return (
      <button
        class="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:border-secondary hover:text-text"
        onClick={() => setOpen(true)}
      >
        Cmd+K {text.button}
      </button>
    );
  }

  return (
    <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-24 backdrop-blur-sm">
      <div class="w-full max-w-2xl rounded-3xl border border-border bg-surface p-5 shadow-2xl">
        <div class="flex items-center justify-between gap-4">
          <input
            autoFocus
            class="w-full bg-transparent text-lg text-text outline-none placeholder:text-muted"
            placeholder={text.placeholder}
            value={query}
            onInput={(event) => setQuery((event.target as HTMLInputElement).value)}
          />
          <button class="text-sm text-muted" onClick={() => setOpen(false)}>{text.close}</button>
        </div>
        <p class="mt-4 text-xs uppercase tracking-[0.18em] text-muted">{text.searchHint}</p>
        <div class="mt-5 space-y-3">
          {loading && <div class="rounded-2xl border border-border px-4 py-3 text-sm text-muted">{text.searching}</div>}
          {!loading && error && <div class="rounded-2xl border border-accent-warm/40 px-4 py-3 text-sm text-accent-warm">{error}</div>}
          {!loading && !error && query.trim() && results.length === 0 && (
            <div class="rounded-2xl border border-border px-4 py-3 text-sm text-muted">{text.empty}</div>
          )}
          {!loading && !error && results.map((result) => (
            <a
              href={result.href}
              target={result.source === 'brave' ? '_blank' : undefined}
              rel={result.source === 'brave' ? 'noreferrer' : undefined}
              class="block rounded-2xl border border-border px-4 py-3 transition hover:border-secondary"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="font-medium text-text">{result.title}</div>
                <span class="rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted">
                  {result.source === 'brave' ? text.braveSource : text.localSource}
                </span>
              </div>
              <div class="mt-1 text-sm text-muted">{result.excerpt}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function localizeHref(href: string, source: Result['source'], locale: Locale) {
  if (source !== 'local') {
    return href;
  }

  if (locale === 'en' && href.startsWith('/')) {
    return href.startsWith('/en/') ? href : `/en${href}`;
  }

  if (locale === 'zh' && href.startsWith('/en/')) {
    return href.slice(3);
  }

  return href;
}
