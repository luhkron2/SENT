'use client';

import { AlertCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'info';
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Critical Issue',
    message: 'Fleet #442 reported brake failure',
    severity: 'critical',
    time: '5 min ago',
    read: false
  },
  {
    id: '2',
    title: 'High Priority',
    message: 'Fleet #338 requires urgent inspection',
    severity: 'high',
    time: '15 min ago',
    read: false
  },
  {
    id: '3',
    title: 'Repair Completed',
    message: 'Fleet #225 is ready for pickup',
    severity: 'info',
    time: '1 hour ago',
    read: true
  }
];

export function NotificationBell() {
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-11 w-11 rounded-full border border-slate-200/80 bg-white/80 p-0 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-slate-300 hover:bg-white hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800/80 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-slate-700 transition-colors dark:text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-[10px] font-bold text-white shadow-lg ring-2 ring-white animate-pulse dark:ring-slate-900">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 shadow-xl border-slate-200/70 dark:border-slate-700">
        <DropdownMenuLabel className="flex items-center justify-between py-3">
          <span className="text-base font-bold text-slate-900 dark:text-white">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs shadow-sm">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {MOCK_NOTIFICATIONS.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={cn(
                'flex flex-col items-start gap-2 p-4 cursor-pointer',
                !notification.read && 'bg-blue-50/50 dark:bg-blue-950/20'
              )}
            >
              <div className="flex w-full items-start gap-3">
                <div className={cn(
                  'mt-0.5 rounded-full p-1.5',
                  notification.severity === 'critical' && 'bg-red-100 dark:bg-red-950/30',
                  notification.severity === 'high' && 'bg-amber-100 dark:bg-amber-950/30',
                  notification.severity === 'info' && 'bg-blue-100 dark:bg-blue-950/30'
                )}>
                  <AlertCircle className={cn(
                    'h-4 w-4',
                    notification.severity === 'critical' && 'text-red-600 dark:text-red-400',
                    notification.severity === 'high' && 'text-amber-600 dark:text-amber-400',
                    notification.severity === 'info' && 'text-blue-600 dark:text-blue-400'
                  )} />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {notification.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {notification.time}
                  </p>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center py-3 font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
