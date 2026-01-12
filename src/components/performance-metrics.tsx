'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  BarChart3,
  Target,
  Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceMetrics {
  overview: {
    totalIssues: number;
    resolvedIssues: number;
    criticalIssues: number;
    resolutionRate: number;
    criticalRate: number;
  };
  trends: {
    issuesLast7Days: number;
    issuesLast30Days: number;
    weeklyTrend: number;
    monthlyTrend: number;
  };
  performance: {
    avgResolutionTimeHours: number;
    responseTimeCount: number;
    firstTimeFixRate: number;
    fleetAvailability: number;
  };
  insights: {
    topCategories: Array<{ category: string; count: number }>;
    problematicFleets: Array<{ fleetNumber: string; issueCount: number }>;
  };
}

export function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Failed to load performance metrics
        </CardContent>
      </Card>
    );
  }

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600 dark:text-green-400';
    if (value >= thresholds.warning) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              getPerformanceColor(metrics.overview.resolutionRate, { good: 85, warning: 70 })
            )}>
              {metrics.overview.resolutionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.overview.resolvedIssues} of {metrics.overview.totalIssues} resolved
            </p>
            <Progress 
              value={metrics.overview.resolutionRate} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              getPerformanceColor(24 - metrics.performance.avgResolutionTimeHours, { good: 20, warning: 12 })
            )}>
              {metrics.performance.avgResolutionTimeHours.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {metrics.performance.responseTimeCount} issues
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Availability</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              getPerformanceColor(metrics.performance.fleetAvailability, { good: 90, warning: 80 })
            )}>
              {metrics.performance.fleetAvailability}%
            </div>
            <p className="text-xs text-muted-foreground">
              Operational fleet units
            </p>
            <Progress 
              value={metrics.performance.fleetAvailability} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              getPerformanceColor(100 - metrics.overview.criticalRate, { good: 95, warning: 85 })
            )}>
              {metrics.overview.criticalIssues}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.overview.criticalRate}% of total issues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trends and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Issue Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.insights.topCategories.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <span className="font-medium">{category.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{category.count} issues</span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ 
                        width: `${metrics.insights.topCategories[0] ? (category.count / metrics.insights.topCategories[0].count) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Fleet Units Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.insights.problematicFleets.slice(0, 5).map((fleet, index) => (
              <div key={fleet.fleetNumber} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={index === 0 ? "destructive" : index === 1 ? "default" : "secondary"}
                    className="w-6 h-6 p-0 flex items-center justify-center text-xs"
                  >
                    {index + 1}
                  </Badge>
                  <span className="font-medium">Fleet #{fleet.fleetNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{fleet.issueCount} issues</span>
                  {index === 0 && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics.trends.issuesLast7Days}</div>
              <div className="text-sm text-muted-foreground">Issues this week</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{metrics.trends.issuesLast30Days}</div>
              <div className="text-sm text-muted-foreground">Issues this month</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{metrics.performance.firstTimeFixRate}%</div>
              <div className="text-sm text-muted-foreground">First-time fix rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}