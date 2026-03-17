import { useEffect, useState } from 'preact/hooks';
import type { Locale } from '../../lib/i18n';

type Thread = {
  id: number;
  title: string;
  username: string;
  content: string;
  created_at: string;
};

type Reply = {
  id: number;
  username: string;
  content: string;
  created_at: string;
};

const copy = {
  zh: {
    replies: '回复',
    username: '用户名',
    email: '邮箱',
    content: '回复内容',
    submit: '提交回复',
    empty: '还没有回复。',
    failed: '提交失败，请稍后重试。'
  },
  en: {
    replies: 'Replies',
    username: 'Username',
    email: 'Email',
    content: 'Reply',
    submit: 'Post reply',
    empty: 'No replies yet.',
    failed: 'Request failed. Please try again.'
  }
} as const;

export default function QuestionThread({ threadId, locale }: { threadId: number; locale: Locale }) {
  const text = copy[locale];
  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void loadThread();
  }, [threadId]);

  async function loadThread() {
    const slug = new URL(window.location.href).searchParams.get('slug');
    if (!slug) {
      return;
    }

    const response = await fetch(`/api/questions/${slug}`);
    const data = await response.json();
    setThread(data.thread ?? null);
    setReplies(data.replies ?? []);
  }

  async function handleSubmit() {
    if (!thread?.id) {
      return;
    }

    setError('');
    const response = await fetch(`/api/questions/${thread.id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, content, website: '' })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      setError(payload?.error ?? text.failed);
      return;
    }

    setUsername('');
    setEmail('');
    setContent('');
    await loadThread();
  }

  return (
    <section class="mt-10 rounded-[2rem] border border-border bg-surface p-6">
      {thread && (
        <div class="mb-8">
          <h1 class="font-display text-4xl tracking-[-0.04em] text-text">{thread.title}</h1>
          <p class="mt-4 text-sm leading-7 text-muted">{thread.content}</p>
        </div>
      )}
      <h2 class="font-display text-3xl tracking-[-0.04em] text-text">{text.replies}</h2>
      <div class="mt-6 space-y-4">
        {replies.length > 0 ? replies.map((reply) => (
          <article class="rounded-3xl border border-border bg-bg/60 p-4">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm text-text">{reply.username}</span>
              <span class="text-xs text-muted">{new Date(reply.created_at).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')}</span>
            </div>
            <p class="mt-3 text-sm leading-7 text-muted">{reply.content}</p>
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
