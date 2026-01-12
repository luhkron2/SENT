'use client';

import { useEffect, useRef, useState } from 'react';

interface RealTimeEvent {
  type: 'connected' | 'heartbeat' | 'issue_created' | 'issue_updated' | 'work_order_created';
  timestamp: string;
  data?: Record<string, unknown>;
}

export function useRealTimeUpdates(onUpdate?: (event: RealTimeEvent) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const connectEventSource = () => {
      try {
        const eventSource = new EventSource('/api/events');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('Real-time connection established');
          setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data: RealTimeEvent = JSON.parse(event.data);
            setLastUpdate(new Date());
            
            if (data.type !== 'heartbeat') {
              console.log('Real-time update received:', data);
            }
            
            if (onUpdate) {
              onUpdate(data);
            }
          } catch (error) {
            console.error('Failed to parse real-time event:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('Real-time connection error:', error);
          setIsConnected(false);
          
          // Reconnect after 5 seconds
          setTimeout(() => {
            if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
              connectEventSource();
            }
          }, 5000);
        };
      } catch (error) {
        console.error('Failed to create EventSource:', error);
        setIsConnected(false);
      }
    };

    connectEventSource();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [onUpdate]);

  return {
    isConnected,
    lastUpdate,
    disconnect: () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
    }
  };
}