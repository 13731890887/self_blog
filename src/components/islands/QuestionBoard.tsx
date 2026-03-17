import { useEffect, useState } from 'preact/hooks';
import type { Locale } from '../../lib/i18n';

type Thread = {
  id: number;
  slug: string;
  title: string;
  username: string;
  content: string;
  created_at: string;
  last_activity_at: string;
  reply_count: number;
};

const copy = {
  zh: {
    heading: '提问与讨论',
    title: '标题',
    username: '用户名',
    email: '邮箱',
    content: '问题内容',
    submit: '发起讨论',
    empty: '还没有讨论。',
    failed: '提交失败，请稍后重试。'
  },
  en: {
    heading: 'Questions & Discussion',
    title: 'Title',
    username: 'Username',
    email: 'Email',
    content: 'Question',
    submit: 'Start thread',
    empty: 'No discussions yet.',
    failed: 'Request failed. Please try again.'
  }
} as const;

export default function QuestionBoard({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const [threads, setThreads] = useState<Thread[]>([]);
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void loadThreads();
  }, []);

  async function loadThreads() {
    const response = await fetch('/api/questions');
    const data = await response.json();
    setThreads(data.questions ?? []);
  }

  async function handleSubmit() {
    setError('');
    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, username, email, content, website: '' })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      setError(payload?.error ?? text.failed);
      return;
    }

    setTitle('');
    setUsername('');
    setEmail('');
    setContent('');
    await loadThreads();
  }

  return (
    <div class="space-y-10">
      <section class="panel rounded-[2rem] p-6">
        <h2 class="font-display text-3xl tracking-[-0.04em] text-text">{text.heading}</h2>
        <div class="mt-6 grid gap-4">
          <input class="rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary" placeholder={text.title} value={title} onInput={(event) => setTitle((event.target as HTMLInputElement).value)} />
          <div class="grid gap-4 md:grid-cols-2">
            <input class="rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary" placeholder={text.username} value={username} onInput={(event) => setUsername((event.target as HTMLInputElement).value)} />
            <input class="rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary" placeholder={text.email} value={email} onInput={(event) => setEmail((event.target as HTMLInputElement).value)} />
          </div>
          <textarea class="min-h-32 resize-none rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary" placeholder={text.content} value={content} onInput={(event) => setContent((event.target as HTMLTextAreaElement).value)} />
          <button class="w-fit rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-[#7a72ff]" onClick={() => void handleSubmit()}>
            {text.submit}
          </button>
          {error && <p class="text-sm text-accent-warm">{error}</p>}
        </div>
      </section>

      <section class="grid gap-4">
        {threads.length > 0 ? threads.map((thread) => (
          <a href={`${locale === 'zh' ? '' : '/en'}/questions/thread?slug=${encodeURIComponent(thread.slug)}`} class="panel rounded-[1.75rem] p-6 transition hover:border-primary">
            <div class="flex items-center justify-between gap-4">
              <h3 class="font-display text-2xl text-text">{thread.title}</h3>
              <span class="text-xs text-muted">{thread.reply_count}</span>
            </div>
            <p class="mt-3 text-sm leading-7 text-muted">{thread.content.slice(0, 160)}</p>
          </a>
        )) : <p class="text-sm text-muted">{text.empty}</p>}
      </section>
    </div>
  );
}
