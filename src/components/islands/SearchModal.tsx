import { useEffect, useMemo, useState } from 'preact/hooks';

type Result = {
  title: string;
  href: string;
  excerpt: string;
};

const fallbackResults: Result[] = [
  {
    title: 'Bandwidth-First Architecture',
    href: '/articles/bandwidth-first-architecture',
    excerpt: 'How Astro islands, SQLite, and static precomputation reduce payload and latency.'
  }
];

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

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

  const results = useMemo(() => {
    if (!query.trim()) return fallbackResults;
    return fallbackResults.filter((item) =>
      `${item.title} ${item.excerpt}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  if (!open) {
    return (
      <button
        class="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:border-secondary hover:text-text"
        onClick={() => setOpen(true)}
      >
        Cmd+K Search
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
            placeholder="Search by topic, concept, or phrase"
            value={query}
            onInput={(event) => setQuery((event.target as HTMLInputElement).value)}
          />
          <button class="text-sm text-muted" onClick={() => setOpen(false)}>Esc</button>
        </div>
        <div class="mt-5 space-y-3">
          {results.map((result) => (
            <a href={result.href} class="block rounded-2xl border border-border px-4 py-3 transition hover:border-secondary">
              <div class="font-medium text-text">{result.title}</div>
              <div class="mt-1 text-sm text-muted">{result.excerpt}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
