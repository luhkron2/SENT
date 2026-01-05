'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, AlertTriangle, Wrench, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function QuickDashboard() {
  const stats = [
    {
      label: 'Open Issues',
      value: '12',
      change: '+3',
      changeType: 'increase',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'In Progress',
      value: '8',
      change: '+2',
      changeType: 'increase',
      icon: Wrench,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Completed Today',
      value: '15',
      change: '+5',
      changeType: 'increase',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Avg. Response Time',
      value: '2.4h',
      change: '-0.5h',
      changeType: 'decrease',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  const recentIssues = [
    {
      id: '1',
      ticket: 'T-1024',
      fleet: 'PM05',
      driver: 'John Smith',
      issue: 'Brake failure warning',
      severity: 'HIGH',
      time: '2 hours ago',
    },
    {
      id: '2',
      ticket: 'T-1023',
      fleet: 'PM12',
      driver: 'Sarah Johnson',
      issue: 'Engine overheating',
      severity: 'CRITICAL',
      time: '3 hours ago',
    },
    {
      id: '3',
      ticket: 'T-1022',
      fleet: 'PM08',
      driver: 'Mike Wilson',
      issue: 'Tire pressure low',
      severity: 'MEDIUM',
      time: '5 hours ago',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-slate-500">from yesterday</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Recent Issues</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/operations" className="text-blue-600 hover:text-blue-700">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {issue.ticket}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        issue.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : issue.severity === 'HIGH'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{issue.issue}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {issue.driver} • {issue.fleet} • {issue.time}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/issues/${issue.id}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/report">
                <Wrench className="h-4 w-4" />
                Report Issue
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/schedule">
                <Clock className="h-4 w-4" />
                View Schedule
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/operations">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
