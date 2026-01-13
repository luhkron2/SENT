'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  Truck, 
  Wrench, 
  AlertTriangle, 
  Settings,
  Database,
  FileText,
  Download,
  RefreshCw,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { LoadingPage } from '@/components/ui/loading';

import { PerformanceMetrics } from '@/components/performance-metrics';

interface DashboardStats {
  totalIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  completedIssues: number;
  criticalIssues: number;
  totalWorkOrders: number;
  scheduledWorkOrders: number;
  totalFleetUnits: number;
  totalDrivers: number;
  recentIssues: Array<{
    id: string;
    ticket: number;
    severity: string;
    category: string;
    fleetNumber: string;
    driverName: string;
    createdAt: string;
    status: string;
  }>;
  issuesByCategory: Record<string, number>;
  issuesBySeverity: Record<string, number>;
  workOrdersByStatus: Record<string, number>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, accessLevel, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || accessLevel !== 'admin') {
        router.push('/access');
        return;
      }
      fetchDashboardStats();
    }
  }, [authLoading, isAuthenticated, accessLevel, router]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const exportAllData = async () => {
    try {
      const response = await fetch('/api/export/all');
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `se-repairs-export-${new Date().toISOString().split('T')[0]}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Data exported successfully');
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'scheduled': return 'bg-purple-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (authLoading) {
    return <LoadingPage text="Checking authentication..." />;
  }

  if (!isAuthenticated || accessLevel !== 'admin') {
    return null; // Will redirect via useEffect
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p>Failed to load dashboard data</p>
          <Button onClick={fetchDashboardStats} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mt-1">
              SE Repairs System Overview
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchDashboardStats} variant="outline" size="default" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={exportAllData} variant="outline" size="default" className="gap-2">
              <Download className="h-4 w-4" />
              Export All Data
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
          onClick={() => router.push('/admin/issues')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIssues}</div>
            <p className="text-xs text-muted-foreground">
              {stats.criticalIssues} critical
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
          onClick={() => router.push('/admin/issues?status=PENDING')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingIssues}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting assignment
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
          onClick={() => router.push('/admin/workorders')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.scheduledWorkOrders} scheduled
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
          onClick={() => router.push('/fleet')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Units</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFleetUnits}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDrivers} drivers
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="issues" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="issues">Recent Issues</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tools">Admin Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Issues</CardTitle>
                <Link href="/admin/issues">
                  <Button variant="outline" size="sm">
                    View All Issues
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentIssues.map((issue) => (
                  <button 
                    type="button"
                    key={issue.id}
                    className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-all hover:shadow-md text-left"
                    onClick={() => router.push(`/issues/${issue.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <Badge className={getSeverityColor(issue.severity)}>
                        #{issue.ticket}
                      </Badge>
                      <div>
                        <p className="font-medium">{issue.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {issue.fleetNumber} • {issue.driverName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getStatusColor(issue.status)}>
                        {issue.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <PerformanceMetrics />
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Fleet Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage drivers, fleet units, and trailer mappings
                </p>
                <Link href="/admin/mappings">
                  <Button className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Mappings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Equipment Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  View all fleet units, trailers, and driver information
                </p>
                <Link href="/admin/equipment">
                  <Button className="w-full">
                    <Truck className="h-4 w-4 mr-2" />
                    View Equipment
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage system users and access levels
                </p>
                <Link href="/admin/users">
                  <Button className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  System Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate comprehensive system reports
                </p>
                <Link href="/admin/reports">
                  <Button className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Work Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage and oversee all work orders
                </p>
                <Link href="/admin/workorders">
                  <Button className="w-full">
                    <Wrench className="h-4 w-4 mr-2" />
                    Manage Work Orders
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure system settings and preferences
                </p>
                <Link href="/admin/settings">
                  <Button className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Data Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Export system data for backup or analysis
                </p>
                <Button onClick={exportAllData} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  System Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  System maintenance and diagnostic tools
                </p>
                <Link href="/admin/maintenance">
                  <Button className="w-full">
                    <Wrench className="h-4 w-4 mr-2" />
                    Maintenance
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}