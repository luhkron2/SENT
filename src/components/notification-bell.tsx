'use client';

import { useEffect, useState } from 'react';
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
import { formatMelbourneShort } from '@/lib/time';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'info';
  time: string;
  read: boolean;
  issueId?: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/issues');
      if (response.ok) {
        const issues = await response.json();
        
        // Convert recent critical/high issues to notifications
        const recentIssues = Array.isArray(issues) ? issues : [];
        const now = Date.now();
        const last24Hours = 24 * 60 * 60 * 1000;
        
        interface IssueData {
          id: string;
          createdAt: string;
          severity: string;
          status: string;
          fleetNumber: string;
          description: string;
        }
        
        const notifs: Notification[] = recentIssues
          .filter((issue: IssueData) => {
            const issueTime = new Date(issue.createdAt).getTime();
            const isRecent = now - issueTime < last24Hours;
            const isImportant = ['CRITICAL', 'HIGH'].includes(issue.severity);
            const isActive = !['COMPLETED', 'CLOSED', 'RESOLVED'].includes(issue.status);
            return isRecent && (isImportant || issue.status === 'COMPLETED') && isActive;
          })
          .slice(0, 10)
          .map((issue: IssueData) => ({
            id: issue.id,
            title: issue.severity === 'CRITICAL' ? 'Critical Issue' : 
                   issue.severity === 'HIGH' ? 'High Priority' :
                   issue.status === 'COMPLETED' ? 'Repair Completed' : 'New Issue',
            message: `${issue.fleetNumber}: ${issue.description.substring(0, 50)}${issue.description.length > 50 ? '...' : ''}`,
            severity: issue.severity === 'CRITICAL' ? 'critical' as const : 
                     issue.severity === 'HIGH' ? 'high' as const : 'info' as const,
            time: formatMelbourneShort(issue.createdAt),
            read: issue.status === 'COMPLETED' || issue.status === 'CLOSED',
            issueId: issue.id
          }));
        
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-10 w-10 rounded-full p-0"
        >
          <Bell className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-bold">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <Link key={notification.id} href={notification.issueId ? `/issues/${notification.issueId}` : '#'}>
                <DropdownMenuItem
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
          </Link>
          ))
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center font-semibold text-blue-600 dark:text-blue-400">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
