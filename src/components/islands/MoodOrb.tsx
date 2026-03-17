import { useEffect, useState } from 'preact/hooks';

type Mood = {
  color: string;
  label: string;
};

export default function MoodOrb() {
  const [mood, setMood] = useState<Mood>({ color: '#00D9C0', label: 'lucid' });

  useEffect(() => {
    fetch('/api/ai/mood')
      .then((response) => response.json())
      .then((data) => setMood(data))
      .catch(() => setMood({ color: '#00D9C0', label: 'lucid' }));
  }, []);

  return (
    <div class="flex items-center gap-2 rounded-full border border-border bg-surface/55 px-3 py-2 text-xs uppercase tracking-[0.24em] text-muted">
      <span class="h-2.5 w-2.5 rounded-full" style={{ background: mood.color, boxShadow: `0 0 16px ${mood.color}` }} />
      <span>{mood.label}</span>
    </div>
  );
}
