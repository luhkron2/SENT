'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {text && <span className="text-sm text-muted-foreground animate-pulse">{text}</span>}
    </div>
  );
}

interface PageLoadingProps {
  fullPage?: boolean;
  text?: string;
}

export function PageLoading({ fullPage = false, text = 'Loading...' }: PageLoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-primary/20"></div>
        <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="text-muted-foreground animate-pulse">{text}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export function SkeletonCard({ lines = 3, showAvatar = false, className = '' }: SkeletonCardProps) {
  return (
    <div className={`skeleton-card p-4 rounded-lg ${className}`}>
      {showAvatar && (
        <div className="skeleton h-10 w-10 rounded-full mb-3"></div>
      )}
      <div className="space-y-2">
        <div className="skeleton h-4 w-3/4 rounded"></div>
        <div className="skeleton h-4 w-1/2 rounded"></div>
        {lines > 2 && <div className="skeleton h-4 w-2/3 rounded"></div>}
        {lines > 3 && <div className="skeleton h-4 w-1/3 rounded"></div>}
      </div>
    </div>
  );
}