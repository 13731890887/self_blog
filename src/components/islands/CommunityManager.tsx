import { useEffect, useState } from 'preact/hooks';
import type { Locale } from '../../lib/i18n';

const copy = {
  zh: {
    articles: '文章管理',
    comments: '评论管理',
    questions: '提问管理',
    edit: '编辑',
    delete: '删除',
    save: '保存',
    cancel: '取消',
    draft: '草稿',
    published: '已发布',
    emptyArticles: '还没有文章。',
    rebuilding: '已删除，站点正在重建。',
    updateSuccess: '文章已更新。',
    updateRebuilding: '文章已更新，站点正在重建。',
    deleteFailed: '删除失败',
    updateFailed: '更新失败',
    loadFailed: '加载文章失败',
    title: '标题',
    description: '摘要',
    tags: '标签',
    tldr: 'TL;DR',
    content: '正文'
  },
  en: {
    articles: 'Article Management',
    comments: 'Comment Moderation',
    questions: 'Question Moderation',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    draft: 'Draft',
    published: 'Published',
    emptyArticles: 'No articles yet.',
    rebuilding: 'Deleted. Site rebuild started.',
    updateSuccess: 'Article updated.',
    updateRebuilding: 'Article updated. Site rebuild started.',
    deleteFailed: 'Delete failed',
    updateFailed: 'Update failed',
    loadFailed: 'Failed to load article',
    title: 'Title',
    description: 'Description',
    tags: 'Tags',
    tldr: 'TL;DR',
    content: 'Content'
  }
} as const;

type Article = {
  slug: string;
  title: string;
  description: string;
  pubDate: string;
  draft: boolean;
};

type ArticleDetail = Article & {
  content: string;
  tags: string[];
  tldr: string;
};

export default function CommunityManager({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const [articles, setArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [pendingKey, setPendingKey] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingSlug, setEditingSlug] = useState('');
  const [editor, setEditor] = useState<ArticleDetail | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const [articlesResponse, commentsResponse, questionsResponse] = await Promise.all([
      fetch('/api/admin/articles'),
      fetch('/api/admin/community/comments'),
      fetch('/api/admin/community/questions')
    ]);
    const articlesData = await articlesResponse.json().catch(() => ({}));
    const commentsData = await commentsResponse.json().catch(() => ({}));
    const questionsData = await questionsResponse.json().catch(() => ({}));
    setArticles(articlesData.articles ?? []);
    setComments(commentsData.comments ?? []);
    setQuestions(questionsData.questions ?? []);
  }

  async function moderate(targetType: 'comments' | 'questions', id: number, action: string) {
    const key = `${targetType}:${id}`;
    setPendingKey(key);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/admin/community/${targetType}/${id}/${action}`, { method: 'POST' });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Delete failed');
      }

      if (targetType === 'comments') {
        setComments((current) => current.filter((item) => item.id !== id));
      } else {
        setQuestions((current) => current.filter((item) => item.id !== id));
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Delete failed');
    } finally {
      setPendingKey('');
    }
  }

  async function deleteArticle(slug: string) {
    const key = `articles:${slug}`;
    setPendingKey(key);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/admin/articles/${encodeURIComponent(slug)}/delete`, { method: 'POST' });
      const payload = await response.json().catch(() => null) as { error?: string; rebuildStarted?: boolean } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? text.deleteFailed);
      }

      setArticles((current) => current.filter((article) => article.slug !== slug));
      if (payload?.rebuildStarted !== false) {
        setMessage(text.rebuilding);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.deleteFailed);
    } finally {
      setPendingKey('');
    }
  }

  async function startEdit(slug: string) {
    const key = `edit:${slug}`;
    setPendingKey(key);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/admin/articles/${encodeURIComponent(slug)}`);
      const payload = await response.json().catch(() => null) as { error?: string; article?: ArticleDetail } | null;
      if (!response.ok || !payload?.article) {
        throw new Error(payload?.error ?? text.loadFailed);
      }

      setEditingSlug(slug);
      setEditor(payload.article);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.loadFailed);
    } finally {
      setPendingKey('');
    }
  }

  async function saveArticle() {
    if (!editor || !editingSlug) {
      return;
    }

    const key = `save:${editingSlug}`;
    setPendingKey(key);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/admin/articles/${encodeURIComponent(editingSlug)}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editor.title,
          content: editor.content,
          metaDescription: editor.description,
          tags: editor.tags,
          tldr: editor.tldr,
          draft: editor.draft
        })
      });

      const payload = await response.json().catch(() => null) as { error?: string; rebuildStarted?: boolean } | null;
      if (!response.ok) {
        throw new Error(payload?.error ?? text.updateFailed);
      }

      setArticles((current) => current.map((article) => (
        article.slug === editingSlug
          ? {
              ...article,
              title: editor.title,
              description: editor.description,
              draft: editor.draft
            }
          : article
      )));
      setMessage(payload?.rebuildStarted === false ? text.updateSuccess : text.updateRebuilding);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.updateFailed);
    } finally {
      setPendingKey('');
    }
  }

  return (
    <div class="space-y-6">
      {error && <p class="text-sm text-accent-warm">{error}</p>}
      {message && <p class="text-sm text-secondary">{message}</p>}
      <section class="rounded-[2rem] border border-border bg-surface p-6">
        <h2 class="font-display text-3xl tracking-[-0.04em] text-text">{text.articles}</h2>
        <div class="mt-5 space-y-3">
          {articles.length > 0 ? articles.map((article) => (
            <div class="rounded-3xl border border-border bg-bg/50 p-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="text-sm text-text">{article.title}</p>
                  <p class="mt-2 text-sm text-muted">{article.slug} · {article.pubDate} · {article.draft ? text.draft : text.published}</p>
                  {article.description && <p class="mt-2 text-sm text-muted">{article.description}</p>}
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="cursor-pointer rounded-full border border-border px-3 py-2 text-xs text-text transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={pendingKey === `edit:${article.slug}` || pendingKey === `articles:${article.slug}`}
                    onClick={() => void startEdit(article.slug)}
                  >
                    {pendingKey === `edit:${article.slug}` ? '...' : text.edit}
                  </button>
                  <button
                    type="button"
                    class="cursor-pointer rounded-full border border-border px-3 py-2 text-xs text-text transition hover:border-accent-warm hover:text-accent-warm disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={pendingKey === `articles:${article.slug}`}
                    onClick={() => void deleteArticle(article.slug)}
                  >
                    {pendingKey === `articles:${article.slug}` ? '...' : text.delete}
                  </button>
                </div>
              </div>
            </div>
          )) : <p class="text-sm text-muted">{text.emptyArticles}</p>}
        </div>
      </section>
      {editor && (
        <section class="rounded-[2rem] border border-border bg-surface p-6">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-display text-3xl tracking-[-0.04em] text-text">{text.edit} · {editingSlug}</h2>
            <label class="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={!editor.draft}
                onInput={(event) => setEditor({ ...editor, draft: !(event.target as HTMLInputElement).checked })}
              />
              {editor.draft ? text.draft : text.published}
            </label>
          </div>
          <div class="mt-5 grid gap-4">
            <label class="grid gap-2">
              <span class="text-sm text-text">{text.title}</span>
              <input
                class="rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                value={editor.title}
                onInput={(event) => setEditor({ ...editor, title: (event.target as HTMLInputElement).value })}
              />
            </label>
            <label class="grid gap-2">
              <span class="text-sm text-text">{text.description}</span>
              <textarea
                class="min-h-24 resize-none rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                value={editor.description}
                onInput={(event) => setEditor({ ...editor, description: (event.target as HTMLTextAreaElement).value })}
              />
            </label>
            <label class="grid gap-2">
              <span class="text-sm text-text">{text.tags}</span>
              <input
                class="rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                value={editor.tags.join(', ')}
                onInput={(event) => setEditor({
                  ...editor,
                  tags: (event.target as HTMLInputElement).value.split(',').map((item) => item.trim()).filter(Boolean)
                })}
              />
            </label>
            <label class="grid gap-2">
              <span class="text-sm text-text">{text.tldr}</span>
              <input
                class="rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                value={editor.tldr}
                onInput={(event) => setEditor({ ...editor, tldr: (event.target as HTMLInputElement).value })}
              />
            </label>
            <label class="grid gap-2">
              <span class="text-sm text-text">{text.content}</span>
              <textarea
                class="min-h-80 resize-y rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                value={editor.content}
                onInput={(event) => setEditor({ ...editor, content: (event.target as HTMLTextAreaElement).value })}
              />
            </label>
          </div>
          <div class="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              class="cursor-pointer rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-[#7a72ff] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pendingKey === `save:${editingSlug}`}
              onClick={() => void saveArticle()}
            >
              {pendingKey === `save:${editingSlug}` ? '...' : text.save}
            </button>
            <button
              type="button"
              class="cursor-pointer rounded-full border border-border px-5 py-3 text-sm text-text transition hover:border-primary hover:text-primary"
              onClick={() => {
                setEditingSlug('');
                setEditor(null);
              }}
            >
              {text.cancel}
            </button>
          </div>
        </section>
      )}
      <section class="rounded-[2rem] border border-border bg-surface p-6">
        <h2 class="font-display text-3xl tracking-[-0.04em] text-text">{text.comments}</h2>
        <div class="mt-5 space-y-3">
          {comments.map((comment) => (
            <div class="rounded-3xl border border-border bg-bg/50 p-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="text-sm text-text">{comment.username} · {comment.article_slug}</p>
                  <p class="mt-2 text-sm text-muted">{comment.content}</p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="cursor-pointer rounded-full border border-border px-3 py-2 text-xs text-text transition hover:border-accent-warm hover:text-accent-warm disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={pendingKey === `comments:${comment.id}`}
                    onClick={() => void moderate('comments', comment.id, 'delete')}
                  >
                    {pendingKey === `comments:${comment.id}` ? '...' : text.delete}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section class="rounded-[2rem] border border-border bg-surface p-6">
        <h2 class="font-display text-3xl tracking-[-0.04em] text-text">{text.questions}</h2>
        <div class="mt-5 space-y-3">
          {questions.map((question) => (
            <div class="rounded-3xl border border-border bg-bg/50 p-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="text-sm text-text">{question.title}</p>
                  <p class="mt-2 text-sm text-muted">{question.username} · {question.status}</p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="cursor-pointer rounded-full border border-border px-3 py-2 text-xs text-text transition hover:border-accent-warm hover:text-accent-warm disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={pendingKey === `questions:${question.id}`}
                    onClick={() => void moderate('questions', question.id, 'delete')}
                  >
                    {pendingKey === `questions:${question.id}` ? '...' : text.delete}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
