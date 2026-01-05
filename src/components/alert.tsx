'use client';

import { Info, CheckCircle2, AlertTriangle, XCircle, Loader2, LucideIcon, XCircle as XCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'loading';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const alertVariants: Record<AlertVariant, { container: string; icon: LucideIcon; iconColor: string }> = {
  info: {
    container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  success: {
    container: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    icon: CheckCircle2,
    iconColor: 'text-green-600 dark:text-green-400',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    icon: AlertTriangle,
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  error: {
    container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    icon: XCircle,
    iconColor: 'text-red-600 dark:text-red-400',
  },
  loading: {
    container: 'bg-slate-50 border-slate-200 dark:bg-slate-900/20 dark:border-slate-800',
    icon: Loader2,
    iconColor: 'text-slate-600 dark:text-slate-400',
  },
};

export function Alert({ variant = 'info', title, children, dismissible, onDismiss, className }: AlertProps) {
  const config = alertVariants[variant];
  const Icon = config.icon;

  return (
    <div className={`relative flex items-start gap-3 rounded-lg border p-4 ${config.container} ${className}`}>
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconColor} ${variant === 'loading' && 'animate-spin'}`} />
      <div className="flex-1">
        {title && <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">{title}</p>}
        <div className="text-sm text-slate-700 dark:text-slate-300">{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded-full p-1 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <XCircleIcon className="h-4 w-4 text-slate-400" />
        </button>
      )}
    </div>
  );
}
