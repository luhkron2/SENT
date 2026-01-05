'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
  href: string;
  status: 'complete' | 'current' | 'pending' | 'error';
}

interface ProgressStepsProps {
  steps: Step[];
  className?: string;
}

export function ProgressSteps({ steps, className }: ProgressStepsProps) {
  const pathname = usePathname();

  const getStepIcon = (status: Step['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'current':
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStepColor = (status: Step['status']) => {
    switch (status) {
      case 'complete':
        return 'text-green-600 dark:text-green-400 border-green-600 dark:border-green-400';
      case 'current':
        return 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400';
      case 'error':
        return 'text-red-600 dark:text-red-400 border-red-600 dark:border-red-400';
      default:
        return 'text-slate-400 dark:text-slate-500 border-slate-300 dark:border-slate-600';
    }
  };

  return (
    <div className={cn('flex items-center justify-center gap-4 flex-wrap', className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <div key={step.href} className="flex items-center">
            <Link
              href={step.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all',
                step.status === 'current'
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : step.status === 'complete'
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-slate-50 dark:bg-slate-900/20',
                getStepColor(step.status)
              )}
            >
              {getStepIcon(step.status)}
              <span className="font-medium text-sm">{step.label}</span>
            </Link>
            {!isLast && (
              <div className="mx-2 flex items-center gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-0.5 w-2 rounded-full ${
                      index < steps.findIndex(s => s.status === 'current')
                        ? 'bg-blue-600'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
