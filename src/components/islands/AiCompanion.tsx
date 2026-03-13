import { useState } from 'preact/hooks';

const prompts = [
  'Summarize the architecture choices in one paragraph.',
  'Why is Astro a good fit for low-bandwidth readers?',
  'What is the fallback path when AI search is unavailable?'
];

export default function AiCompanion() {
  const [selected, setSelected] = useState(prompts[0]);

  return (
    <section class="rounded-3xl border border-border bg-surface p-5">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.24em] text-secondary">AI Companion</p>
          <h3 class="mt-2 font-display text-2xl text-text">Claude Haiku SSE shell</h3>
        </div>
        <span class="rounded-full bg-secondary/12 px-3 py-1 text-xs text-secondary">runtime island</span>
      </div>
      <div class="mt-5 flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            class={`rounded-full px-3 py-2 text-sm transition ${
              selected === prompt
                ? 'bg-primary text-white'
                : 'border border-border text-muted hover:border-primary hover:text-text'
            }`}
            onClick={() => setSelected(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
      <div class="mt-5 rounded-2xl border border-border bg-bg/70 p-4 text-sm leading-7 text-muted">
        <p class="text-text">{selected}</p>
        <p class="mt-3">
          The production version posts to <code>/api/ai/chat</code> and streams token chunks over SSE.
          This scaffold keeps the UI shell in place while backend keys and prompts are wired later.
        </p>
      </div>
    </section>
  );
}
