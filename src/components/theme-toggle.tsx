'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-11 w-11 rounded-full border border-slate-200/80 bg-white/80 p-0 shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-800/80">
        <div className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-11 w-11 rounded-full border border-slate-200/80 bg-white/80 p-0 text-slate-600 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:rotate-12 hover:border-slate-300 hover:bg-white hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-amber-500 transition-transform" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700 transition-transform dark:text-slate-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
