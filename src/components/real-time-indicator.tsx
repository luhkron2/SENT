'use client';

import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealTimeEvent {
  type: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}

interface RealTimeIndicatorProps {
  onUpdate?: (event: RealTimeEvent) => void;
  className?: string;
}

export function RealTimeIndicator({ onUpdate, className }: RealTimeIndicatorProps) {
  const { isConnected, lastUpdate } = useRealTimeUpdates(onUpdate);

  return (
    <Badge 
      variant={isConnected ? 'default' : 'secondary'} 
      className={cn(
        'gap-1 text-xs',
        isConnected 
          ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' 
          : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
        className
      )}
    >
      {isConnected ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}
      <span className="hidden sm:inline">
        {isConnected ? 'Live' : 'Offline'}
      </span>
      {lastUpdate && (
        <span className="hidden md:inline text-xs opacity-75">
          • {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </Badge>
  );
}