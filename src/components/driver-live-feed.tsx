'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Megaphone,
  Clock,
  CheckCircle,
  Wrench,
  Calendar,
  Loader2,
  RefreshCw,
  MessageCircle,
} from 'lucide-react';
import { formatMelbourneShort } from '@/lib/time';

interface FeedItem {
  id: string;
  type: 'comment' | 'status_change' | 'assignment' | 'schedule';
  ticket?: number;
  fleetNumber?: string;
  message: string;
  author?: string;
  authorRole?: string;
  timestamp: string;
  severity?: string;
  status?: string;
}

interface DriverLiveFeedProps {
  className?: string;
  maxItems?: number;
}

export function DriverLiveFeed({ className = '', maxItems = 10 }: DriverLiveFeedProps) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch('/api/feed?limit=' + maxItems);
      if (response.ok) {
        const data = await response.json();
        setFeed(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [maxItems]);

  useEffect(() => {
    fetchFeed();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchFeed(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchFeed]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="h-4 w-4" />;
      case 'status_change':
        return <CheckCircle className="h-4 w-4" />;
      case 'assignment':
        return <Wrench className="h-4 w-4" />;
      case 'schedule':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'comment':
        return 'from-blue-500 to-blue-600';
      case 'status_change':
        return 'from-emerald-500 to-green-600';
      case 'assignment':
        return 'from-purple-500 to-purple-600';
      case 'schedule':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PENDING: 'secondary',
      IN_PROGRESS: 'default',
      SCHEDULED: 'outline',
      COMPLETED: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="text-xs">
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className={`rounded-3xl border-2 border-slate-200/80 bg-white/95 shadow-xl backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/80 ${className}`}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`rounded-3xl border-2 border-slate-200/80 bg-white/95 shadow-xl backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/80 ${className}`}>
      <CardHeader className="space-y-3 border-b border-slate-200/70 p-6 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Live Updates
              </CardTitle>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Recent activity from workshop & operations
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchFeed(true)}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {feed.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No recent updates. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {feed.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border-2 border-slate-200/70 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-blue-600"
              >
                {/* Background gradient effect */}
                <div className="absolute right-0 top-0 h-24 w-24 opacity-5 transition-opacity group-hover:opacity-10">
                  <div className={`h-full w-full bg-gradient-to-br ${getTypeColor(item.type)} blur-2xl`} />
                </div>

                <div className="relative space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${getTypeColor(item.type)} shadow-sm`}>
                        {getIcon(item.type)}
                      </div>
                      {item.ticket && (
                        <Badge variant="outline" className="font-mono text-xs">
                          #{item.ticket}
                        </Badge>
                      )}
                      {item.fleetNumber && (
                        <Badge variant="secondary" className="text-xs">
                          Fleet {item.fleetNumber}
                        </Badge>
                      )}
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      {formatMelbourneShort(item.timestamp)}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {item.message}
                    </p>
                    {item.author && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        — {item.author}
                        {item.authorRole && ` (${item.authorRole})`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 rounded-xl border border-blue-200/70 bg-blue-50/70 p-4 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-100">
          <p className="font-medium">💡 Stay Informed</p>
          <p className="mt-1 text-xs">
            This feed shows real-time updates from workshop mechanics and operations staff about your submitted issues.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
