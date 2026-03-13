import { useEffect, useState } from 'preact/hooks';
import type { Locale } from '../../lib/i18n';

export default function ViewCounter({ slug, locale }: { slug: string; locale: Locale }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;

    fetch(`/api/views?slug=${encodeURIComponent(slug)}`)
      .then((response) => response.json())
      .then((data) => {
        if (alive) setViews(data.views ?? 0);
      })
      .catch(() => {
        if (alive) setViews(0);
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  return <span>{views === null ? '...' : locale === 'zh' ? `${views} 阅读` : `${views} reads`}</span>;
}
