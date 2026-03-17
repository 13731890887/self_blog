import { useEffect, useState } from 'preact/hooks';
import type { Locale } from '../../lib/i18n';

type ThemeMode = 'default' | 'soft';

const copy = {
  zh: {
    default: '夜色',
    soft: '浅雾'
  },
  en: {
    default: 'Night',
    soft: 'Mist'
  }
} as const;

const STORAGE_KEY = 'self-blog-theme';

export default function ThemeSwitcher({ locale }: { locale: Locale }) {
  const [theme, setTheme] = useState<ThemeMode>('default');

  useEffect(() => {
    const next = readStoredTheme();
    applyTheme(next);
    setTheme(next);
  }, []);

  function handleToggle() {
    const next = theme === 'default' ? 'soft' : 'default';
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      class="rounded-full border border-border px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted transition hover:border-primary hover:bg-white/4 hover:text-text"
    >
      {theme === 'default' ? copy[locale].soft : copy[locale].default}
    </button>
  );
}

function readStoredTheme(): ThemeMode {
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === 'soft' ? 'soft' : 'default';
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
}
