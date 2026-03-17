import { useEffect, useState } from 'preact/hooks';
import { localizedPath, type Locale, getLocaleCopy } from '../../lib/i18n';

type TopArticle = {
  slug: string;
  title: string;
  excerpt: string;
  views: number;
};

export default function TopArticleSpotlight({ locale }: { locale: Locale }) {
  const copy = getLocaleCopy(locale);
  const [article, setArticle] = useState<TopArticle | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;

    fetch('/api/views/top')
      .then((response) => response.json())
      .then((data) => {
        if (!alive) {
          return;
        }

        setArticle(data.article ?? null);
        setLoaded(true);
      })
      .catch(() => {
        if (!alive) {
          return;
        }

        setArticle(null);
        setLoaded(true);
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <aside class="panel h-full rounded-[1.75rem] p-6 md:p-7">
      <p class="text-xs uppercase tracking-[0.28em] text-secondary">{copy.hottestArticle}</p>
      {article ? (
        <>
          <h2 class="mt-4 font-display text-3xl leading-tight tracking-[-0.04em] text-text">
            {article.title}
          </h2>
          <p class="mt-4 text-sm leading-7 text-muted">{article.excerpt}</p>
          <div class="mt-6 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.22em] text-muted">
            <span>
              {article.views} {copy.hottestArticleReads}
            </span>
            <a
              href={localizedPath(locale, `/articles/${article.slug}`)}
              class="inline-flex items-center rounded-full border border-border px-4 py-2 text-text transition hover:border-primary hover:text-primary"
            >
              {copy.openArticle}
            </a>
          </div>
        </>
      ) : (
        <div class="mt-4">
          <p class="text-sm leading-7 text-muted">
            {loaded ? copy.hottestArticleFallback : '...'}
          </p>
        </div>
      )}
    </aside>
  );
}
