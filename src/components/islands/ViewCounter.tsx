import { useEffect, useState } from 'preact/hooks';

export default function ViewCounter({ slug }: { slug: string }) {
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

  return <span>{views === null ? '...' : `${views} reads`}</span>;
}
