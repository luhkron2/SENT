'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  Calendar,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface TimelineEvent {
  id: string;
  type: 'issue_created' | 'status_change' | 'comment' | 'work_order' | 'completed';
  date: string;
  title: string;
  description: string;
  severity?: string;
  status?: string;
  category?: string;
  issueId?: string;
  ticket?: number;
  author?: string;
  metadata?: Record<string, unknown>;
}

interface ServiceHistoryStats {
  totalIssues: number;
  completedRepairs: number;
  pendingIssues: number;
  inProgressIssues: number;
  criticalIssues: number;
  categories: string[];
  firstIssueDate: string | null;
  lastIssueDate: string | null;
}

interface ServiceHistoryTimelineProps {
  fleetNumber: string;
  className?: string;
  maxEvents?: number;
}

export function ServiceHistoryTimeline({ 
  fleetNumber, 
  className,
  maxEvents = 20 
}: ServiceHistoryTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [stats, setStats] = useState<ServiceHistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!fleetNumber) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/fleet/${encodeURIComponent(fleetNumber)}/history`);
      if (response.ok) {
        const data = await response.json();
        setTimeline(data.timeline || []);
        setStats(data.stats || null);
      } else {
        setError('Failed to load service history');
      }
    } catch (err) {
      console.error('Failed to fetch service history:', err);
      setError('Failed to load service history');
    } finally {
      setLoading(false);
    }
  }, [fleetNumber]);

  useEffect(() => {
    if (fleetNumber) {
      fetchHistory();
    }
  }, [fleetNumber, fetchHistory]);

  const getEventIcon = (type: TimelineEvent['type'], severity?: string) => {
    switch (type) {
      case 'issue_created':
        return severity === 'CRITICAL' || severity === 'HIGH' 
          ? <AlertTriangle className="h-4 w-4 text-red-500" />
          : <FileText className="h-4 w-4 text-blue-500" />;
      case 'work_order':
        return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getEventColor = (type: TimelineEvent['type'], severity?: string) => {
    switch (type) {
      case 'issue_created':
        if (severity === 'CRITICAL') return 'border-red-500 bg-red-50 dark:bg-red-950/20';
        if (severity === 'HIGH') return 'border-orange-500 bg-orange-50 dark:bg-orange-950/20';
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'work_order':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-950/20';
      case 'completed':
        return 'border-green-500 bg-green-50 dark:bg-green-950/20';
      case 'comment':
        return 'border-gray-300 bg-gray-50 dark:bg-gray-800/50';
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-800/50';
    }
  };

  const displayedEvents = expanded ? timeline : timeline.slice(0, maxEvents);

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Service History...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-red-200", className)}>
        <CardContent className="p-6 text-center text-red-600">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchHistory} className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Service History - {fleetNumber}
          </CardTitle>
          {stats && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                {stats.totalIssues} total
              </Badge>
              <Badge variant="default" className="gap-1 bg-green-600">
                <CheckCircle2 className="h-3 w-3" />
                {stats.completedRepairs} completed
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Summary */}
        {stats && stats.totalIssues > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalIssues}</div>
              <div className="text-xs text-muted-foreground">Total Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completedRepairs}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingIssues + stats.inProgressIssues}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.criticalIssues}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
          </div>
        )}

        {/* Timeline */}
        {timeline.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No service history found for this vehicle</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            {/* Events */}
            <div className="space-y-4">
              {displayedEvents.map((event) => (
                <div key={event.id} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute left-2 w-5 h-5 rounded-full border-2 bg-white dark:bg-slate-900 flex items-center justify-center",
                    event.type === 'completed' ? 'border-green-500' :
                    event.type === 'issue_created' && event.severity === 'CRITICAL' ? 'border-red-500' :
                    event.type === 'work_order' ? 'border-orange-500' :
                    'border-gray-300'
                  )}>
                    {getEventIcon(event.type, event.severity)}
                  </div>

                  {/* Event card */}
                  <div className={cn(
                    "p-3 rounded-lg border-l-4 transition-all hover:shadow-md",
                    getEventColor(event.type, event.severity)
                  )}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{event.title}</span>
                          {event.ticket && (
                            <Badge variant="outline" className="text-xs">
                              #{event.ticket}
                            </Badge>
                          )}
                          {event.severity && (
                            <Badge 
                              variant={event.severity === 'CRITICAL' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {event.severity}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {event.description}
                        </p>
                        {event.author && (
                          <p className="text-xs text-muted-foreground mt-1">
                            By: {event.author}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show more/less button */}
            {timeline.length > maxEvents && (
              <div className="text-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="gap-2"
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show {timeline.length - maxEvents} More Events
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}