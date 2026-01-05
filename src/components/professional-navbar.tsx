'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Bell, LogOut, User, Menu, X, LayoutDashboard, FileText, Wrench, Settings, Activity, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  href: string;
  icon: any;
}

export function ProfessionalNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/operations', icon: LayoutDashboard },
    { label: 'Report Issue', href: '/report', icon: FileText },
    { label: 'Workshop', href: '/workshop', icon: Wrench },
    { label: 'Operations', href: '/operations', icon: Settings },
    { label: 'Analytics', href: '/operations', icon: Activity },
  ];

  const quickActions: QuickAction[] = [
    { label: 'New Report', href: '/report', icon: FileText },
    { label: 'View Schedule', href: '/schedule', icon: Activity },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/95 dark:supports-[backdrop-filter]:bg-slate-950/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center space-x-2 font-bold text-slate-900 dark:text-slate-100"
          >
            <Wrench className="h-6 w-6" />
            <span className="hidden sm:inline-block">SE Repairs</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md',
                    isActive(item.href)
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Notifications"
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </Button>

          <div className="hidden sm:flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Profile">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t bg-slate-50 px-4 py-3 dark:bg-slate-900">
          <div className="container">
            <Input
              type="search"
              placeholder="Search issues, vehicles, or tickets..."
              className="max-w-xl"
              autoFocus
            />
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="border-t bg-slate-50 dark:bg-slate-900 md:hidden">
          <nav className="container space-y-1 px-4 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
              <div className="flex items-center gap-2 px-3 py-2">
                <User className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2">
                <LogOut className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Logout</span>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
