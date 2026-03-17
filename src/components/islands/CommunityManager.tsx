import { useEffect, useState } from 'preact/hooks';
import type { Locale } from '../../lib/i18n';

const copy = {
  zh: {
    comments: '评论管理',
    questions: '提问管理',
    delete: '删除'
  },
  en: {
    comments: 'Comment Moderation',
    questions: 'Question Moderation',
    delete: 'Delete'
  }
} as const;

export default function CommunityManager({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const [comments, setComments] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [pendingKey, setPendingKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const [commentsResponse, questionsResponse] = await Promise.all([
      fetch('/api/admin/community/comments'),
      fetch('/api/admin/community/questions')
    ]);
    const commentsData = await commentsResponse.json().catch(() => ({}));
    const questionsData = await questionsResponse.json().catch(() => ({}));
    setComments(commentsData.comments ?? []);
    setQuestions(questionsData.questions ?? []);
  }

  async function moderate(targetType: 'comments' | 'questions', id: number, action: string) {
    const key = `${targetType}:${id}`;
    setPendingKey(key);
    setError('');

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

  return (
    <div class="space-y-6">
      {error && <p class="text-sm text-accent-warm">{error}</p>}
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
