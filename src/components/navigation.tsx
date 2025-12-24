'use client';

import { useTranslation } from '@/components/translation-provider';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ComponentType, SVGProps, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Activity,
  Check,
  FileText,
  Home,
  Languages,
  Menu,
  Moon,
  Phone,
  Settings,
  Sun,
  Wrench,
  X,
} from 'lucide-react';

type NavItem = {
  key: 'home' | 'report' | 'workshop' | 'operations' | 'troubleshoot';
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { key: 'home', href: '/', icon: Home },
  { key: 'report', href: '/report', icon: FileText },
  { key: 'workshop', href: '/workshop', icon: Wrench },
  { key: 'operations', href: '/operations', icon: Settings },
  { key: 'troubleshoot', href: '/troubleshoot', icon: Activity },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { t, translate, locale, setLocale } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleToggleTheme = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleLanguageChange = (newLocale: 'en' | 'pa') => {
    setLocale(newLocale);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/80 animate-slide-down">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link 
          href="/" 
          className="group flex items-center gap-3 rounded-xl p-2 transition-all duration-300 hover:scale-105"
          aria-label="Home"
        >
          <Logo size="sm" variant="icon" className="md:hidden transition-transform group-hover:scale-110" />
          <Logo size="md" className="hidden md:inline-flex transition-transform group-hover:scale-105" />
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-3 md:flex">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'group flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300',
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-md shadow-blue-500/10 ring-2 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-500/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-white',
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-all duration-300',
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'group-hover:scale-110 group-hover:text-blue-500 dark:group-hover:text-blue-400',
                  )}
                />
                {translate(t.nav[item.key])}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200">
            <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            {t.nav.hotlinePhone}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-full border border-slate-200/80 bg-white/80 p-0 text-slate-600 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-slate-300 hover:bg-white hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Preferences</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleLanguageChange('en')}
                className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800"
              >
                <Languages className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="flex-1">English</span>
                {locale === 'en' && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('pa')}
                className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800"
              >
                <Languages className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="flex-1">ਪੰਜਾਬੀ (Punjabi)</span>
                {locale === 'pa' && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleTheme}
            className="h-11 w-11 rounded-full border border-slate-200/80 bg-white/80 p-0 text-slate-600 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:rotate-12 hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <div suppressHydrationWarning>
              {!mounted ? (
                <Moon className="h-5 w-5" />
              ) : resolvedTheme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </div>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full p-0 text-slate-600 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Preferences</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleLanguageChange('en')}
                className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800"
              >
                <Languages className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="flex-1">English</span>
                {locale === 'en' && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('pa')}
                className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800"
              >
                <Languages className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="flex-1">ਪੰਜਾਬੀ (Punjabi)</span>
                {locale === 'pa' && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleTheme}
            className="h-10 w-10 rounded-full p-0 text-slate-600 hover:scale-110 hover:rotate-12 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <div suppressHydrationWarning>
              {!mounted ? (
                <Moon className="h-5 w-5" />
              ) : resolvedTheme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </div>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-10 w-10 rounded-full p-0 hover:scale-110 transition-transform"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-slate-200/50 bg-white/95 px-4 py-6 shadow-xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/95 md:hidden animate-slide-down">
          <div className="space-y-2" role="navigation" aria-label="Mobile navigation">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-4 rounded-lg px-4 py-3 text-lg font-semibold transition-all duration-300',
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-md shadow-blue-500/10 dark:bg-blue-900/30 dark:text-blue-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-white',
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className={cn(
                    'h-6 w-6 transition-transform duration-300',
                    isActive ? 'text-blue-600 dark:text-blue-400' : ''
                  )} />
                  {translate(t.nav[item.key])}
                </Link>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/report" onClick={() => setMobileMenuOpen(false)}>
              <Button className="h-12 w-full rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-base font-bold text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all">
                {t.nav.reportCta}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}