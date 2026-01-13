'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { Truck, Calendar, User, MessageSquare, Wrench, MapPin, ChevronRight } from 'lucide-react';
import { formatMelbourneShort } from '@/lib/time';
import { Issue, Severity } from '@prisma/client';
import Link from 'next/link';
import { useTranslation } from '@/components/translation-provider';
import { cn } from '@/lib/utils';

interface IssueCardProps {
  issue: Issue;
  onSchedule?: () => void;
  onComment?: () => void;
  compact?: boolean;
}

const severityAccent: Record<Severity, string> = {
  LOW: 'border-l-green-500',
  MEDIUM: 'border-l-yellow-500',
  HIGH: 'border-l-orange-500',
  CRITICAL: 'border-l-red-500',
};

const severityGlow: Record<Severity, string> = {
  LOW: '',
  MEDIUM: '',
  HIGH: 'shadow-orange-500/5',
  CRITICAL: 'shadow-red-500/10 animate-pulse-subtle',
};

export function IssueCard({ issue, onSchedule, onComment, compact = false }: IssueCardProps) {
  const { translate } = useTranslation();
  const isUrgent = issue.severity === 'CRITICAL' || issue.severity === 'HIGH';
  
  return (
    <Card className={cn(
      "group relative overflow-hidden rounded-xl border-l-4 transition-all duration-300",
      "hover:shadow-lg hover:-translate-y-0.5",
      "bg-white dark:bg-slate-900/80",
      severityAccent[issue.severity],
      severityGlow[issue.severity],
      isUrgent && "ring-1 ring-inset ring-red-500/10 dark:ring-red-500/20"
    )}>
      {/* Urgency indicator for critical issues */}
      {issue.severity === 'CRITICAL' && (
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <div className="absolute top-2 right-[-20px] w-[80px] bg-red-500 text-white text-[10px] font-bold text-center py-0.5 rotate-45 shadow-sm">
            URGENT
          </div>
        </div>
      )}

      <CardContent className={cn("p-4", compact && "p-3")}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <Link 
              href={`/issues/${issue.id}`}
              className="group/link flex items-center gap-2"
            >
              <span className={cn(
                "font-bold text-slate-900 dark:text-white group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors",
                compact ? "text-sm" : "text-base"
              )}>
                #{issue.ticket}
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className={cn(
                "font-semibold text-slate-700 dark:text-slate-300 truncate",
                compact ? "text-sm" : "text-base"
              )}>
                {issue.fleetNumber}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover/link:opacity-100 transition-opacity" />
            </Link>
            {!compact && (issue.trailerA || issue.trailerB) && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <Truck className="w-3 h-3 inline mr-1" />
                {[issue.trailerA, issue.trailerB].filter(Boolean).join(' / ')}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 items-end shrink-0">
            <SeverityBadge severity={issue.severity} showIcon />
            <StatusBadge status={issue.status} />
          </div>
        </div>

        {/* Category & Description */}
        <div className="space-y-2 mb-3">
          <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
            {issue.category}
          </div>
          <p className={cn(
            "text-slate-600 dark:text-slate-300 leading-relaxed",
            compact ? "text-xs line-clamp-1" : "text-sm line-clamp-2"
          )}>
            {issue.description}
          </p>
        </div>

        {/* Meta info */}
        <div className={cn(
          "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400",
          compact && "gap-x-3"
        )}>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px]">{issue.driverName}</span>
          </div>
          {issue.location && !compact && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[100px]">{issue.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatMelbourneShort(issue.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        {(onSchedule || onComment) && (
          <div className={cn(
            "flex gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800",
            compact && "pt-2 mt-2"
          )}>
            {onSchedule && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => { e.stopPropagation(); onSchedule(); }}
                className="flex-1 h-8 text-xs font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950 dark:hover:text-blue-400"
              >
                <Wrench className="w-3.5 h-3.5 mr-1.5" />
                {translate('Schedule')}
              </Button>
            )}
            {onComment && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => { e.stopPropagation(); onComment(); }}
                className="flex-1 h-8 text-xs font-medium hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 dark:hover:bg-purple-950 dark:hover:text-purple-400"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                {translate('Update')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

