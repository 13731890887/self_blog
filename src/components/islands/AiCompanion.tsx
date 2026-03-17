import { useEffect, useRef, useState } from 'preact/hooks';
import type { Locale } from '../../lib/i18n';
import { consumeSseBuffer } from '../../lib/sse';

const prompts = {
  zh: [
    '用一段话总结这套架构选择。',
    '为什么 Astro 适合低带宽读者？',
    '当 AI 搜索不可用时，降级路径是什么？'
  ],
  en: [
    'Summarize the architecture choices in one paragraph.',
    'Why is Astro a good fit for low-bandwidth readers?',
    'What is the fallback path when AI search is unavailable?'
  ]
} as const;

const copy = {
  zh: {
    label: 'AI 伴读',
    title: 'Claude Haiku SSE 伴读',
    runtime: '运行时 Island',
    inputPlaceholder: '输入你想追问的问题，或直接点击下面的推荐问题',
    send: '发送',
    stop: '停止',
    thinking: 'AI 正在思考...',
    idle: '这里会出现流式回答。',
    error: '请求失败，请稍后重试。',
    inputCount: '问题长度'
  },
  en: {
    label: 'AI Companion',
    title: 'Claude Haiku SSE companion',
    runtime: 'runtime island',
    inputPlaceholder: 'Ask a follow-up question or use one of the suggested prompts',
    send: 'Send',
    stop: 'Stop',
    thinking: 'AI is thinking...',
    idle: 'The streaming answer will appear here.',
    error: 'Request failed. Please try again.',
    inputCount: 'Prompt length'
  }
} as const;

export default function AiCompanion({ locale, slug }: { locale: Locale; slug: string }) {
  const text = copy[locale];
  const promptList = prompts[locale];
  const [selected, setSelected] = useState(promptList[0]);
  const [input, setInput] = useState(promptList[0]);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setInput(selected);
  }, [selected]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function handleSubmit(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed || loading) {
      return;
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const streamResponse = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: trimmed,
          slug
        }),
        signal: controller.signal
      });

      if (!streamResponse.ok || !streamResponse.body) {
        throw new Error(`chat failed with ${streamResponse.status}`);
      }

      const reader = streamResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
        const parsed = consumeSseBuffer(buffer, done);
        buffer = parsed.remainder;

        for (const line of parsed.events) {
          setResponse((current) => current + line);
        }

        if (done) break;
      }
    } catch (requestError) {
      if (!controller.signal.aborted) {
        console.error(requestError);
        setError(text.error);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  function handleStop() {
    abortRef.current?.abort();
    setLoading(false);
  }

  return (
    <section class="rounded-3xl border border-border bg-surface p-5">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.24em] text-secondary">{text.label}</p>
          <h3 class="mt-2 font-display text-2xl text-text">{text.title}</h3>
        </div>
        <span class="rounded-full bg-secondary/12 px-3 py-1 text-xs text-secondary">{text.runtime}</span>
      </div>
      <div class="mt-5 flex flex-wrap gap-2">
        {promptList.map((prompt) => (
          <button
            class={`rounded-full px-3 py-2 text-sm transition ${
              selected === prompt
                ? 'bg-primary text-white'
                : 'border border-border text-muted hover:border-primary hover:text-text'
            }`}
            onClick={() => {
              setSelected(prompt);
              void handleSubmit(prompt);
            }}
          >
            {prompt}
          </button>
        ))}
      </div>
      <div class="mt-5 rounded-2xl border border-border bg-bg/70 p-4 text-sm leading-7 text-muted">
        <textarea
          class="mt-4 min-h-28 w-full resize-none rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
          value={input}
          placeholder={text.inputPlaceholder}
          onInput={(event) => setInput((event.target as HTMLTextAreaElement).value)}
        />
        <p class="mt-2 text-xs text-muted">{text.inputCount}: {input.length}</p>
        <div class="mt-4 flex items-center gap-3">
          <button
            class="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-[#7a72ff] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || !input.trim()}
            onClick={() => void handleSubmit(input)}
          >
            {text.send}
          </button>
          <button
            class="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:border-primary hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!loading}
            onClick={handleStop}
          >
            {text.stop}
          </button>
        </div>
        <div class="mt-5 rounded-2xl border border-border bg-surface px-4 py-4">
          {loading && response.length === 0 && <p class="text-sm text-muted">{text.thinking}</p>}
          {!loading && !error && response.length === 0 && <p class="text-sm text-muted">{text.idle}</p>}
          {error && <p class="text-sm text-accent-warm">{error}</p>}
          {response && <p class="whitespace-pre-wrap text-sm leading-7 text-text">{response}</p>}
        </div>
      </div>
    </section>
  );
}
