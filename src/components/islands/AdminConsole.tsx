import { useEffect, useState } from 'preact/hooks';
import type { Locale } from '../../lib/i18n';

type AssistResult = {
  refinedTitle: string;
  titleAlternatives: string[];
  tags: string[];
  metaDescription: string;
  readabilityNotes: string[];
};

const copy = {
  zh: {
    loginTitle: '后台登录',
    loginDescription: '输入后台密码，服务端会签发受保护的 session cookie。',
    passwordPlaceholder: '输入后台密码',
    login: '登录',
    logout: '退出登录',
    titleLabel: '草稿标题',
    titlePlaceholder: '输入当前文章标题',
    contentLabel: '草稿内容',
    contentPlaceholder: '粘贴文章草稿、段落或大纲',
    submit: '生成建议',
    loading: '生成中...',
    notConfigured: '后台密码尚未配置，请设置 ADMIN_PASSWORD 和 ADMIN_SESSION_SECRET。',
    loginFailed: '登录失败，请检查密码。',
    requestFailed: '请求失败，请稍后重试。',
    resultTitle: '优化标题',
    alternatives: '备选标题',
    tags: '标签建议',
    meta: 'Meta Description',
    notes: '可读性建议',
    loggedIn: '已通过服务端鉴权'
  },
  en: {
    loginTitle: 'Admin Login',
    loginDescription: 'Enter the admin password to receive a protected session cookie.',
    passwordPlaceholder: 'Enter admin password',
    login: 'Login',
    logout: 'Logout',
    titleLabel: 'Draft title',
    titlePlaceholder: 'Enter the current article title',
    contentLabel: 'Draft content',
    contentPlaceholder: 'Paste the draft, article body, or outline',
    submit: 'Generate suggestions',
    loading: 'Generating...',
    notConfigured: 'Admin auth is not configured yet. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.',
    loginFailed: 'Login failed. Check the password.',
    requestFailed: 'Request failed. Please try again.',
    resultTitle: 'Refined title',
    alternatives: 'Alternatives',
    tags: 'Suggested tags',
    meta: 'Meta description',
    notes: 'Readability notes',
    loggedIn: 'Authenticated by server-side session'
  }
} as const;

export default function AdminConsole({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const [configured, setConfigured] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [result, setResult] = useState<AssistResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void refreshSession();
  }, []);

  async function refreshSession() {
    const response = await fetch('/api/admin/session');
    const data = await response.json() as { configured: boolean; authenticated: boolean };
    setConfigured(data.configured);
    setAuthenticated(data.authenticated);
  }

  async function handleLogin() {
    setError('');
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      setError(text.loginFailed);
      return;
    }

    setPassword('');
    await refreshSession();
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setResult(null);
  }

  async function handleAssist() {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/admin/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          content,
          locale
        })
      });

      if (!response.ok) {
        throw new Error(`assist failed with ${response.status}`);
      }

      const data = await response.json() as AssistResult;
      setResult(data);
    } catch (requestError) {
      console.error(requestError);
      setError(text.requestFailed);
    } finally {
      setLoading(false);
    }
  }

  if (!configured) {
    return (
      <div class="rounded-3xl border border-accent-warm/40 bg-surface p-6 text-sm leading-7 text-accent-warm">
        {text.notConfigured}
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div class="rounded-[2rem] border border-border bg-surface p-8">
        <p class="text-xs uppercase tracking-[0.24em] text-accent-warm">{text.loginTitle}</p>
        <p class="mt-4 max-w-2xl text-sm leading-7 text-muted">{text.loginDescription}</p>
        <div class="mt-6 flex flex-col gap-4 md:flex-row">
          <input
            type="password"
            class="w-full rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
            placeholder={text.passwordPlaceholder}
            value={password}
            onInput={(event) => setPassword((event.target as HTMLInputElement).value)}
          />
          <button
            class="rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-[#7a72ff]"
            onClick={() => void handleLogin()}
          >
            {text.login}
          </button>
        </div>
        {error && <p class="mt-4 text-sm text-accent-warm">{error}</p>}
      </div>
    );
  }

  return (
    <div class="space-y-6">
      <div class="rounded-[2rem] border border-border bg-surface p-8">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.24em] text-secondary">{text.loggedIn}</p>
            <h2 class="mt-3 font-display text-3xl tracking-[-0.04em] text-text">{text.loginTitle}</h2>
          </div>
          <button
            class="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:border-primary hover:text-text"
            onClick={() => void handleLogout()}
          >
            {text.logout}
          </button>
        </div>

        <div class="mt-8 grid gap-4">
          <label class="grid gap-2">
            <span class="text-sm text-text">{text.titleLabel}</span>
            <input
              class="rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
              placeholder={text.titlePlaceholder}
              value={title}
              onInput={(event) => setTitle((event.target as HTMLInputElement).value)}
            />
          </label>
          <label class="grid gap-2">
            <span class="text-sm text-text">{text.contentLabel}</span>
            <textarea
              class="min-h-64 rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
              placeholder={text.contentPlaceholder}
              value={content}
              onInput={(event) => setContent((event.target as HTMLTextAreaElement).value)}
            />
          </label>
        </div>

        <div class="mt-6 flex items-center gap-3">
          <button
            class="rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-[#7a72ff] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || !content.trim()}
            onClick={() => void handleAssist()}
          >
            {loading ? text.loading : text.submit}
          </button>
        </div>
        {error && <p class="mt-4 text-sm text-accent-warm">{error}</p>}
      </div>

      {result && (
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-3xl border border-border bg-surface p-6">
            <p class="text-xs uppercase tracking-[0.22em] text-secondary">{text.resultTitle}</p>
            <p class="mt-4 text-xl text-text">{result.refinedTitle || '-'}</p>
          </div>
          <div class="rounded-3xl border border-border bg-surface p-6">
            <p class="text-xs uppercase tracking-[0.22em] text-secondary">{text.meta}</p>
            <p class="mt-4 text-sm leading-7 text-text">{result.metaDescription || '-'}</p>
          </div>
          <div class="rounded-3xl border border-border bg-surface p-6">
            <p class="text-xs uppercase tracking-[0.22em] text-secondary">{text.alternatives}</p>
            <ul class="mt-4 space-y-2 text-sm text-text">
              {result.titleAlternatives.map((item) => <li>{item}</li>)}
            </ul>
          </div>
          <div class="rounded-3xl border border-border bg-surface p-6">
            <p class="text-xs uppercase tracking-[0.22em] text-secondary">{text.tags}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              {result.tags.map((item) => (
                <span class="rounded-full border border-border px-3 py-1 text-sm text-text">{item}</span>
              ))}
            </div>
          </div>
          <div class="rounded-3xl border border-border bg-surface p-6 md:col-span-2">
            <p class="text-xs uppercase tracking-[0.22em] text-secondary">{text.notes}</p>
            <ul class="mt-4 space-y-2 text-sm leading-7 text-text">
              {result.readabilityNotes.map((item) => <li>{item}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
