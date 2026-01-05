'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  type: 'success' | 'error' | 'pending';
  title: string;
  description: string;
  time: string;
}

export function ActivityFeed() {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'success',
      title: 'Issue T-1024 resolved',
      description: 'Brake repair completed for PM05',
      time: '10 minutes ago',
    },
    {
      id: '2',
      type: 'pending',
      title: 'Issue T-1023 in progress',
      description: 'Engine diagnostic for PM12',
      time: '25 minutes ago',
    },
    {
      id: '3',
      type: 'success',
      title: 'New issue submitted',
      description: 'T-1025 reported by John Smith',
      time: '1 hour ago',
    },
    {
      id: '4',
      type: 'error',
      title: 'Sync failed',
      description: 'Unable to sync with Gearbox API',
      time: '2 hours ago',
    },
    {
      id: '5',
      type: 'success',
      title: 'Work order scheduled',
      description: 'PM08 scheduled for tomorrow',
      time: '3 hours ago',
    },
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-600" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'pending':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and system events</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/operations" className="text-blue-600 hover:text-blue-700">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex gap-3 rounded-lg border p-3 ${getActivityColor(activity.type)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                  {activity.title}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  {activity.description}
                </p>
                <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
