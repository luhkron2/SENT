'use client';

import { FileText, Wrench, Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Status } from '@prisma/client';

const STATUS_STEPS = [
  { status: 'PENDING', label: 'Reported', icon: FileText, color: 'blue' },
  { status: 'IN_PROGRESS', label: 'In Progress', icon: Wrench, color: 'amber' },
  { status: 'SCHEDULED', label: 'Scheduled', icon: Calendar, color: 'purple' },
  { status: 'COMPLETED', label: 'Completed', icon: CheckCircle2, color: 'emerald' },
] as const;

interface IssueProgressTrackerProps {
  currentStatus: Status;
  compact?: boolean;
  showLabels?: boolean;
  className?: string;
}

export function IssueProgressTracker({
  currentStatus,
  compact = false,
  showLabels = true,
  className,
}: IssueProgressTrackerProps) {
  const currentStepIndex = STATUS_STEPS.findIndex((step) => step.status === currentStatus);

  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'upcoming' => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
            style={{
              width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {STATUS_STEPS.map((step, index) => {
            const status = getStepStatus(index);
            const IconComponent = step.icon;

            return (
              <div
                key={step.status}
                className={cn('flex flex-col items-center', compact ? 'gap-1' : 'gap-2')}
              >
                {/* Icon Circle */}
                <div
                  className={cn(
                    'relative z-10 flex items-center justify-center rounded-full border-2 transition-all duration-300',
                    compact ? 'h-10 w-10' : 'h-12 w-12',
                    status === 'completed' && [
                      'border-emerald-500 bg-emerald-500 shadow-lg shadow-emerald-500/30',
                    ],
                    status === 'current' && [
                      `border-${step.color}-500 bg-${step.color}-500 shadow-lg shadow-${step.color}-500/30 animate-pulse`,
                    ],
                    status === 'upcoming' && [
                      'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900',
                    ]
                  )}
                >
                  <IconComponent
                    className={cn(
                      'transition-all',
                      compact ? 'h-5 w-5' : 'h-6 w-6',
                      status === 'completed' || status === 'current'
                        ? 'text-white'
                        : 'text-slate-400 dark:text-slate-600'
                    )}
                  />
                </div>

                {/* Label */}
                {showLabels && (
                  <div className="flex flex-col items-center gap-0.5">
                    <span
                      className={cn(
                        'text-center font-medium transition-all',
                        compact ? 'text-xs' : 'text-sm',
                        status === 'current'
                          ? 'text-slate-900 dark:text-white'
                          : status === 'completed'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-500 dark:text-slate-500'
                      )}
                    >
                      {step.label}
                    </span>
                    {status === 'current' && (
                      <span className="text-[0.65rem] font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Current
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
