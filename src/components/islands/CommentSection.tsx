import { useEffect, useState } from 'preact/hooks';
import type { Locale } from '../../lib/i18n';

type Comment = {
  id: number;
  parent_id: number | null;
  username: string;
  content: string;
  created_at: string;
};

const copy = {
  zh: {
    title: '评论',
    empty: '还没有评论。',
    username: '用户名',
    email: '邮箱',
    content: '评论内容',
    submit: '提交评论',
    failed: '提交失败，请稍后重试。'
  },
  en: {
    title: 'Comments',
    empty: 'No comments yet.',
    username: 'Username',
    email: 'Email',
    content: 'Comment',
    submit: 'Post comment',
    failed: 'Request failed. Please try again.'
  }
} as const;

export default function CommentSection({ slug, locale }: { slug: string; locale: Locale }) {
  const text = copy[locale];
  const [comments, setComments] = useState<Comment[]>([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void loadComments();
  }, [slug]);

  async function loadComments() {
    const response = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
    const data = await response.json();
    setComments(data.comments ?? []);
  }

  async function handleSubmit() {
    setError('');
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        articleSlug: slug,
        username,
        email,
        content,
        website: ''
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      setError(payload?.error ?? text.failed);
      return;
    }

    setUsername('');
    setEmail('');
    setContent('');
    await loadComments();
  }

  return (
    <section class="mt-10 rounded-[2rem] border border-border bg-surface p-6">
      <h2 class="font-display text-3xl tracking-[-0.04em] text-text">{text.title}</h2>
      <div class="mt-6 space-y-4">
        {comments.length > 0 ? comments.map((comment) => (
          <article class="rounded-3xl border border-border bg-bg/60 p-4">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm text-text">{comment.username}</span>
              <span class="text-xs text-muted">{new Date(comment.created_at).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')}</span>
            </div>
            <p class="mt-3 text-sm leading-7 text-muted">{comment.content}</p>
          </article>
        )) : <p class="text-sm text-muted">{text.empty}</p>}
      </div>
      <div class="mt-6 grid gap-4">
        <div class="grid gap-4 md:grid-cols-2">
          <input class="rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary" placeholder={text.username} value={username} onInput={(event) => setUsername((event.target as HTMLInputElement).value)} />
          <input class="rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary" placeholder={text.email} value={email} onInput={(event) => setEmail((event.target as HTMLInputElement).value)} />
        </div>
        <textarea class="min-h-28 resize-none rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary" placeholder={text.content} value={content} onInput={(event) => setContent((event.target as HTMLTextAreaElement).value)} />
        <button class="w-fit rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-[#7a72ff]" onClick={() => void handleSubmit()}>
          {text.submit}
        </button>
        {error && <p class="text-sm text-accent-warm">{error}</p>}
      </div>
    </section>
  );
}
