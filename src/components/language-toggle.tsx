'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';

export function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const nextLocale = locale === 'en' ? 'pa' : 'en';
  const label = locale === 'en' ? t.language.punjabi : t.language.english;

  const handleToggle = () => {
    if (loading) return;
    setLoading(true);
    setLocale(nextLocale);
    // Small timeout to give feedback while UI re-renders with new strings
    setTimeout(() => setLoading(false), 150);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className="h-10 w-10 rounded-full p-0 text-slate-600 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 disabled:opacity-50"
      aria-label={label}
      title={label}
      data-active-locale={locale}
    >
      <Languages className="h-4 w-4" />
      <span className="sr-only">{loading ? 'Loading...' : label}</span>
    </Button>
  );
}
