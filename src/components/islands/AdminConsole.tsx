import { useEffect, useRef, useState } from 'preact/hooks';
import type { Locale } from '../../lib/i18n';

type AssistResult = {
  refinedTitle: string;
  titleAlternatives: string[];
  tags: string[];
  metaDescription: string;
  readabilityNotes: string[];
};

type PublishResult = {
  ok: boolean;
  slug: string;
  href: string;
  draft: boolean;
  rebuildStarted?: boolean;
  rebuildLogPath?: string;
};

type SiteSettings = {
  hero: {
    zh: {
      title: string;
      description: string;
    };
    en: {
      title: string;
      description: string;
    };
  };
  tags: Array<{
    zh: string;
    en: string;
  }>;
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
    contentHint: '支持 Markdown / MDX。可直接输入标题、列表、代码块，或上传图片插入 Markdown 图片语法。',
    tagLabel: '文章标签',
    tagPlaceholder: '点击选择标签',
    uploadImage: '上传图片',
    uploadingImage: '上传中...',
    importDocument: '导入 Word',
    importingDocument: '导入中...',
    importDocumentHint: '支持 .docx，导入后会把正文转成 Markdown 填入编辑器。',
    insertImage: '插入图片',
    imageAltPlaceholder: '图片说明（可选）',
    submit: '生成建议',
    saveDraft: '保存草稿',
    publish: '发布文章',
    saveSettings: '保存首页与标签配置',
    savingSettings: '保存配置中...',
    loading: '生成中...',
    publishing: '提交中...',
    notConfigured: '后台密码尚未配置，请设置 ADMIN_PASSWORD 和 ADMIN_SESSION_SECRET。',
    loginFailed: '登录失败，请检查密码。',
    requestFailed: '请求失败，请稍后重试。',
    emptyContent: '请先输入草稿内容。',
    emptyTitle: '请先输入标题。',
    resultTitle: '优化标题',
    alternatives: '备选标题',
    tags: '标签建议',
    meta: 'Meta Description',
    notes: '可读性建议',
    loggedIn: '已通过服务端鉴权',
    contentCount: '正文长度',
    titleCount: '标题长度',
    publishSuccessDraft: '草稿已保存',
    publishSuccessLive: '文章已发布，站点正在重建。',
    publishSuccessLivePending: '文章已发布。当前已有重建任务在进行中，请稍后刷新站点查看。',
    publishHint: '草稿会直接写入 src/content/articles；正式发布后会自动触发一次站点重建。',
    heroEditor: '首页文案',
    heroTitleZh: '中文标题',
    heroDescriptionZh: '中文副标题',
    heroTitleEn: '英文标题',
    heroDescriptionEn: '英文副标题',
    tagEditor: '标签池',
    tagZh: '中文 ID',
    tagEn: '英文 ID',
    addTag: '新增标签',
    removeTag: '删除',
    settingsSaved: '首页与标签配置已保存',
    tagsHint: '点击选择已有标签；未选择标签时系统会使用内部默认标签。'
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
    contentHint: 'Markdown / MDX supported. Write headings, lists, code fences, or upload an image to insert Markdown image syntax.',
    tagLabel: 'Article tags',
    tagPlaceholder: 'Click to select tags',
    uploadImage: 'Upload image',
    uploadingImage: 'Uploading...',
    importDocument: 'Import Word',
    importingDocument: 'Importing...',
    importDocumentHint: 'Supports .docx. The document will be converted to Markdown and inserted into the editor.',
    insertImage: 'Insert image',
    imageAltPlaceholder: 'Image alt text (optional)',
    submit: 'Generate suggestions',
    saveDraft: 'Save draft',
    publish: 'Publish article',
    saveSettings: 'Save hero and tag settings',
    savingSettings: 'Saving settings...',
    loading: 'Generating...',
    publishing: 'Submitting...',
    notConfigured: 'Admin auth is not configured yet. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.',
    loginFailed: 'Login failed. Check the password.',
    requestFailed: 'Request failed. Please try again.',
    emptyContent: 'Enter draft content before submitting.',
    emptyTitle: 'Enter a title before submitting.',
    resultTitle: 'Refined title',
    alternatives: 'Alternatives',
    tags: 'Suggested tags',
    meta: 'Meta description',
    notes: 'Readability notes',
    loggedIn: 'Authenticated by server-side session',
    contentCount: 'Content length',
    titleCount: 'Title length',
    publishSuccessDraft: 'Draft saved',
    publishSuccessLive: 'Article published and site rebuild started.',
    publishSuccessLivePending: 'Article published. Another rebuild is already in progress, so refresh the site shortly.',
    publishHint: 'Drafts are written to src/content/articles. Publishing automatically starts a site rebuild.',
    heroEditor: 'Homepage copy',
    heroTitleZh: 'Chinese title',
    heroDescriptionZh: 'Chinese description',
    heroTitleEn: 'English title',
    heroDescriptionEn: 'English description',
    tagEditor: 'Tag pool',
    tagZh: 'Chinese ID',
    tagEn: 'English ID',
    addTag: 'Add tag',
    removeTag: 'Remove',
    settingsSaved: 'Homepage copy and tag settings saved',
    tagsHint: 'Select from existing tags. If no tag is selected, the system will use an internal fallback tag.'
  }
} as const;

export default function AdminConsole({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const [configured, setConfigured] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageAlt, setImageAlt] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [importingDocument, setImportingDocument] = useState(false);
  const [result, setResult] = useState<AssistResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [error, setError] = useState('');
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    void refreshSession();
  }, []);

  async function refreshSession() {
    const response = await fetch('/api/admin/session');
    const data = await response.json() as { configured: boolean; authenticated: boolean };
    setConfigured(data.configured);
    setAuthenticated(data.authenticated);
    if (data.authenticated) {
      await loadSettings();
    }
  }

  async function loadSettings() {
    const response = await fetch('/api/admin/settings');
    if (!response.ok) {
      return;
    }

    const data = await response.json() as SiteSettings;
    setSiteSettings(data);
  }

  async function handleLogin() {
    setError('');
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      setError(payload?.error ?? text.loginFailed);
      return;
    }

    setPassword('');
    await refreshSession();
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setResult(null);
    setPublishResult(null);
    setSettingsMessage('');
  }

  async function handleAssist() {
    if (!content.trim()) {
      setError(text.emptyContent);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setPublishResult(null);

    try {
      const response = await fetch('/api/admin/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, locale })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? `assist failed with ${response.status}`);
      }

      const data = await response.json() as AssistResult;
      setResult(data);

      const knownTags = getAvailableTags(siteSettings).map((item) => item.en);
      const suggested = data.tags.map(normalizeTagValue).filter((tag) => knownTags.includes(tag));
      if (suggested.length > 0) {
        setSelectedTags((current) => [...new Set([...current, ...suggested])]);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.requestFailed);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish(draft: boolean) {
    const finalTitle = (result?.refinedTitle || title).trim();
    if (!finalTitle) {
      setError(text.emptyTitle);
      return;
    }

    if (!content.trim()) {
      setError(text.emptyContent);
      return;
    }

    setPublishing(true);
    setError('');
    setPublishResult(null);

    try {
      const response = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          content,
          metaDescription: result?.metaDescription ?? '',
          tags: selectedTags,
          tldr: result?.readabilityNotes?.[0] ?? '',
          draft
        })
      });

      const payload = await response.json().catch(() => null) as { error?: string } & Partial<PublishResult> | null;
      if (!response.ok) {
        throw new Error(payload?.error ?? text.requestFailed);
      }

      const next = payload as PublishResult;
      setTitle(finalTitle);
      setSelectedTags([]);
      setPublishResult(next);

    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.requestFailed);
    } finally {
      setPublishing(false);
    }
  }

  async function handleSaveSettings() {
    if (!siteSettings) {
      return;
    }

    setSavingSettings(true);
    setError('');
    setSettingsMessage('');

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      });

      const payload = await response.json().catch(() => null) as { error?: string; settings?: SiteSettings } | null;
      if (!response.ok) {
        throw new Error(payload?.error ?? text.requestFailed);
      }

      if (payload?.settings) {
        setSiteSettings(payload.settings);
      }
      setSettingsMessage(text.settingsSaved);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.requestFailed);
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleImageUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    target.value = '';

    if (!file) {
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      const form = new FormData();
      form.set('image', file);
      form.set('alt', imageAlt);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: form
      });

      const payload = await response.json().catch(() => null) as { error?: string; markdown?: string } | null;
      if (!response.ok || !payload?.markdown) {
        throw new Error(payload?.error ?? text.requestFailed);
      }

      insertIntoContent(payload.markdown);
      setImageAlt('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.requestFailed);
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleDocumentImport(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    target.value = '';

    if (!file) {
      return;
    }

    setImportingDocument(true);
    setError('');

    try {
      const form = new FormData();
      form.set('document', file);

      const response = await fetch('/api/admin/import-docx', {
        method: 'POST',
        body: form
      });

      const payload = await response.json().catch(() => null) as { error?: string; title?: string; content?: string } | null;
      if (!response.ok || !payload?.content) {
        throw new Error(payload?.error ?? text.requestFailed);
      }

      if (!title.trim() && payload.title) {
        setTitle(payload.title);
      }

      setContent((current) => {
        if (!current.trim()) {
          return payload.content!;
        }

        return insertMarkdownBlock(current, payload.content!);
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.requestFailed);
    } finally {
      setImportingDocument(false);
    }
  }

  function insertIntoContent(snippet: string) {
    const textarea = contentRef.current;
    if (!textarea) {
      setContent((current) => insertMarkdownBlock(current, snippet));
      return;
    }

    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const current = textarea.value;
    const prefix = current.slice(0, start);
    const suffix = current.slice(end);
    const insertion = buildBlockInsertion(prefix, suffix, snippet);
    const next = `${prefix}${insertion}${suffix}`;
    setContent(next);

    queueMicrotask(() => {
      textarea.focus();
      const cursor = prefix.length + insertion.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  function updateTag(index: number, field: 'zh' | 'en', value: string) {
    setSiteSettings((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        tags: current.tags.map((tag, tagIndex) =>
          tagIndex === index
            ? {
                ...tag,
                [field]: field === 'en' ? normalizeTagDraft(value) : value
              }
            : tag
        )
      };
    });
  }

  function addTagRow() {
    setSiteSettings((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        tags: [...current.tags, { zh: '', en: '' }]
      };
    });
  }

  function removeTagRow(index: number) {
    const removed = siteSettings?.tags[index]?.en;
    setSiteSettings((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        tags: current.tags.filter((_, tagIndex) => tagIndex !== index)
      };
    });

    if (removed) {
      const normalized = normalizeTagValue(removed);
      setSelectedTags((current) => current.filter((item) => item !== normalized));
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) => {
      const normalized = normalizeTagValue(tag);
      if (current.includes(normalized)) {
        return current.filter((item) => item !== normalized);
      }

      return [...current, normalized];
    });
  }

  if (!configured) {
    return <div class="rounded-3xl border border-accent-warm/40 bg-surface p-6 text-sm leading-7 text-accent-warm">{text.notConfigured}</div>;
  }

  if (!authenticated) {
    return (
      <div class="mx-auto w-full max-w-4xl rounded-[2rem] border border-border bg-surface p-8">
        <p class="text-xs uppercase tracking-[0.24em] text-accent-warm">{text.loginTitle}</p>
        <p class="mt-4 max-w-2xl text-sm leading-7 text-muted">{text.loginDescription}</p>
        <div class="mt-6 flex flex-col gap-4 md:flex-row">
          <input
            type="password"
            class="w-full rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
            placeholder={text.passwordPlaceholder}
            value={password}
            onInput={(event) => setPassword((event.target as HTMLInputElement).value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void handleLogin();
              }
            }}
          />
          <button class="rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-[#7a72ff]" onClick={() => void handleLogin()}>
            {text.login}
          </button>
        </div>
        {error && <p class="mt-4 text-sm text-accent-warm">{error}</p>}
      </div>
    );
  }

  return (
    <div class="space-y-6">
      <div class="mx-auto w-full max-w-4xl rounded-[2rem] border border-border bg-surface p-8">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.24em] text-secondary">{text.loggedIn}</p>
            <h2 class="mt-3 font-display text-3xl tracking-[-0.04em] text-text">{text.loginTitle}</h2>
          </div>
          <button class="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:border-primary hover:text-text" onClick={() => void handleLogout()}>
            {text.logout}
          </button>
        </div>

        <div class="mt-8 grid gap-4">
          <label class="grid gap-2">
            <div class="flex items-center justify-between gap-4">
              <span class="text-sm text-text">{text.titleLabel}</span>
              <span class="text-xs text-muted">{text.titleCount}: {title.length}</span>
            </div>
            <input
              class="rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
              placeholder={text.titlePlaceholder}
              value={title}
              onInput={(event) => setTitle((event.target as HTMLInputElement).value)}
            />
          </label>
          <label class="grid gap-2">
            <div class="flex items-center justify-between gap-4">
              <span class="text-sm text-text">{text.contentLabel}</span>
              <span class="text-xs text-muted">{text.contentCount}: {content.length}</span>
            </div>
            <textarea
              ref={contentRef}
              class="min-h-64 resize-none rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
              placeholder={text.contentPlaceholder}
              value={content}
              onInput={(event) => setContent((event.target as HTMLTextAreaElement).value)}
            />
            <p class="text-xs leading-6 text-muted">{text.contentHint}</p>
            <div class="flex flex-wrap items-center gap-3">
              <input
                class="min-w-60 rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                placeholder={text.imageAltPlaceholder}
                value={imageAlt}
                onInput={(event) => setImageAlt((event.target as HTMLInputElement).value)}
              />
              <label class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-text transition hover:border-primary hover:text-primary">
                <span>{uploadingImage ? text.uploadingImage : text.uploadImage}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                  class="hidden"
                  disabled={uploadingImage}
                  onChange={(event) => void handleImageUpload(event)}
                />
              </label>
              <label class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-text transition hover:border-primary hover:text-primary">
                <span>{importingDocument ? text.importingDocument : text.importDocument}</span>
                <input
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  class="hidden"
                  disabled={importingDocument}
                  onChange={(event) => void handleDocumentImport(event)}
                />
              </label>
            </div>
            <p class="text-xs leading-6 text-muted">{text.importDocumentHint}</p>
          </label>
          <div class="grid gap-3">
            <span class="text-sm text-text">{text.tagLabel}</span>
            <div class="flex flex-wrap gap-2">
              {getAvailableTags(siteSettings).map((tag) => {
                const active = selectedTags.includes(tag.en);
                return (
                  <button
                    type="button"
                    class={active
                      ? 'rounded-full border border-secondary bg-secondary/12 px-4 py-2 text-sm text-secondary transition'
                      : 'rounded-full border border-border bg-surface-strong px-4 py-2 text-sm text-muted transition hover:border-primary hover:text-text'}
                    onClick={() => toggleTag(tag.en)}
                  >
                    {locale === 'zh' ? `${tag.zh} · ${tag.en}` : `${tag.en} · ${tag.zh}`}
                  </button>
                );
              })}
            </div>
            <p class="text-xs text-muted">
              {selectedTags.length > 0 ? selectedTags.join(', ') : text.tagPlaceholder}
            </p>
          </div>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button class="rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-[#7a72ff] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading || !content.trim()} onClick={() => void handleAssist()}>
            {loading ? text.loading : text.submit}
          </button>
          <button class="rounded-full border border-border px-5 py-3 text-sm font-medium text-text transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60" disabled={publishing || !content.trim()} onClick={() => void handlePublish(true)}>
            {publishing ? text.publishing : text.saveDraft}
          </button>
          <button class="rounded-full bg-secondary px-5 py-3 text-sm font-medium text-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60" disabled={publishing || !content.trim()} onClick={() => void handlePublish(false)}>
            {publishing ? text.publishing : text.publish}
          </button>
        </div>
        <p class="mt-3 text-xs text-muted">{text.publishHint}</p>
        <p class="mt-1 text-xs text-muted">{text.tagsHint}</p>
        {error && <p class="mt-4 text-sm text-accent-warm">{error}</p>}
        {publishResult && (
          <div class="mt-4 rounded-2xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-text">
            <p>
              {publishResult.draft
                ? text.publishSuccessDraft
                : (publishResult.rebuildStarted === false ? text.publishSuccessLivePending : text.publishSuccessLive)}
            </p>
            <a href={publishResult.href} class="mt-1 inline-block text-secondary">{publishResult.href}</a>
          </div>
        )}
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
              {result.titleAlternatives.length > 0 ? result.titleAlternatives.map((item) => <li>{item}</li>) : <li>-</li>}
            </ul>
          </div>
          <div class="rounded-3xl border border-border bg-surface p-6">
            <p class="text-xs uppercase tracking-[0.22em] text-secondary">{text.tags}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              {result.tags.length > 0 ? result.tags.map((item) => <span class="rounded-full border border-border px-3 py-1 text-sm text-text">{item}</span>) : <span class="text-sm text-text">-</span>}
            </div>
          </div>
          <div class="rounded-3xl border border-border bg-surface p-6 md:col-span-2">
            <p class="text-xs uppercase tracking-[0.22em] text-secondary">{text.notes}</p>
            <ul class="mt-4 space-y-2 text-sm leading-7 text-text">
              {result.readabilityNotes.length > 0 ? result.readabilityNotes.map((item) => <li>{item}</li>) : <li>-</li>}
            </ul>
          </div>
        </div>
      )}

      {siteSettings && (
        <div class="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div class="rounded-[2rem] border border-border bg-surface p-6">
            <p class="text-xs uppercase tracking-[0.22em] text-secondary">{text.heroEditor}</p>
            <div class="mt-5 grid gap-4">
              <label class="grid gap-2">
                <span class="text-sm text-text">{text.heroTitleZh}</span>
                <input class="rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary" value={siteSettings.hero.zh.title} onInput={(event) => setSiteSettings({ ...siteSettings, hero: { ...siteSettings.hero, zh: { ...siteSettings.hero.zh, title: (event.target as HTMLInputElement).value } } })} />
              </label>
              <label class="grid gap-2">
                <span class="text-sm text-text">{text.heroDescriptionZh}</span>
                <textarea class="min-h-24 resize-none rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary" value={siteSettings.hero.zh.description} onInput={(event) => setSiteSettings({ ...siteSettings, hero: { ...siteSettings.hero, zh: { ...siteSettings.hero.zh, description: (event.target as HTMLTextAreaElement).value } } })} />
              </label>
              <label class="grid gap-2">
                <span class="text-sm text-text">{text.heroTitleEn}</span>
                <input class="rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary" value={siteSettings.hero.en.title} onInput={(event) => setSiteSettings({ ...siteSettings, hero: { ...siteSettings.hero, en: { ...siteSettings.hero.en, title: (event.target as HTMLInputElement).value } } })} />
              </label>
              <label class="grid gap-2">
                <span class="text-sm text-text">{text.heroDescriptionEn}</span>
                <textarea class="min-h-24 resize-none rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary" value={siteSettings.hero.en.description} onInput={(event) => setSiteSettings({ ...siteSettings, hero: { ...siteSettings.hero, en: { ...siteSettings.hero.en, description: (event.target as HTMLTextAreaElement).value } } })} />
              </label>
            </div>
          </div>

          <div class="rounded-[2rem] border border-border bg-surface p-6">
            <div class="flex items-center justify-between gap-4">
              <p class="text-xs uppercase tracking-[0.22em] text-secondary">{text.tagEditor}</p>
              <button class="rounded-full border border-border px-4 py-2 text-sm text-text transition hover:border-primary hover:text-primary" onClick={() => addTagRow()}>
                {text.addTag}
              </button>
            </div>
            <div class="mt-5 grid gap-4">
              {siteSettings.tags.map((tag, index) => (
                <div class="rounded-3xl border border-border bg-bg/50 p-4">
                  <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
                    <label class="grid gap-2">
                      <span class="text-xs text-muted">{text.tagZh}</span>
                      <input class="rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary" value={tag.zh} onInput={(event) => updateTag(index, 'zh', (event.target as HTMLInputElement).value)} />
                    </label>
                    <label class="grid gap-2">
                      <span class="text-xs text-muted">{text.tagEn}</span>
                      <input class="rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary" value={tag.en} onInput={(event) => updateTag(index, 'en', (event.target as HTMLInputElement).value)} />
                    </label>
                    <button class="rounded-full border border-border px-4 py-3 text-sm text-muted transition hover:border-accent-warm hover:text-accent-warm" onClick={() => removeTagRow(index)}>
                      {text.removeTag}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div class="mt-6 flex flex-wrap items-center gap-3">
              <button class="rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-[#7a72ff] disabled:cursor-not-allowed disabled:opacity-60" disabled={savingSettings} onClick={() => void handleSaveSettings()}>
                {savingSettings ? text.savingSettings : text.saveSettings}
              </button>
              {settingsMessage && <p class="text-sm text-secondary">{settingsMessage}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function normalizeTagValue(value: string) {
  return value.trim().toLowerCase().replace(/[_\s]+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function normalizeTagDraft(value: string) {
  return value
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function getAvailableTags(settings: SiteSettings | null) {
  const configuredTags = settings?.tags ?? [];
  return configuredTags
    .map((tag) => ({
      zh: tag.zh.trim(),
      en: normalizeTagValue(tag.en)
    }))
    .filter((tag) => tag.zh && tag.en && tag.en !== 'note' && tag.en !== 'notes')
    .filter((tag, index, list) => list.findIndex((item) => item.en === tag.en) === index);
}

function insertMarkdownBlock(current: string, snippet: string) {
  return `${current}${buildBlockInsertion(current, '', snippet)}`;
}

function buildBlockInsertion(prefix: string, suffix: string, snippet: string) {
  const body = snippet.trim();
  if (!body) {
    return '';
  }

  const needsLeadingBreak = prefix.length > 0 && !prefix.endsWith('\n\n');
  const needsTrailingBreak = suffix.length > 0 && !suffix.startsWith('\n\n');

  return `${needsLeadingBreak ? '\n\n' : ''}${body}${needsTrailingBreak ? '\n\n' : '\n'}`;
}
