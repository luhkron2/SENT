'use client';

import { useCallback, useEffect, useMemo, useState, DragEvent } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IssueCard } from '@/components/issue-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Filter, Wrench, GripVertical, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from '@/components/notification-bell';
import { QuickActionsMenu } from '@/components/quick-actions-menu';
import { Issue, Status } from '@prisma/client';
import { TruckBooking } from '@/components/truck-booking';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { LoadingPage } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

export default function WorkshopPage() {
  const { isAuthenticated, accessLevel, loading, logout } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [fleetFilter, setFleetFilter] = useState<string>('');
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [updateStatus, setUpdateStatus] = useState<Status>('PENDING');
  const [updateMessage, setUpdateMessage] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    try {
      const response = await fetch('/api/issues');
      if (response.ok) {
        const data = await response.json();
        setIssues(Array.isArray(data) ? data : (data.issues ?? []));
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || accessLevel !== 'workshop') {
        router.push('/access');
        return;
      }
      void fetchIssues();
    }
  }, [loading, isAuthenticated, accessLevel, router, fetchIssues]);

  const filteredIssues = useMemo(() => {
    let filtered = [...issues];

    if (severityFilter !== 'all') {
      filtered = filtered.filter((issue) => issue.severity === severityFilter);
    }

    if (fleetFilter) {
      filtered = filtered.filter((issue) =>
        issue.fleetNumber.toLowerCase().includes(fleetFilter.toLowerCase())
      );
    }

    return filtered;
  }, [issues, severityFilter, fleetFilter]);

  const getIssuesByStatus = (status: string) => {
    return filteredIssues.filter((issue) => issue.status === status);
  };

  const openUpdateDialog = (issue: Issue) => {
    setSelectedIssue(issue);
    setUpdateStatus(issue.status);
    setUpdateMessage('');
    setUpdateDialogOpen(true);
  };

  // Drag and drop handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, issueId: string) => {
    setDraggedIssueId(issueId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', issueId);
  };

  const handleDragEnd = () => {
    setDraggedIssueId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, newStatus: Status) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    const issueId = e.dataTransfer.getData('text/plain');
    if (!issueId) return;

    const issue = issues.find(i => i.id === issueId);
    if (!issue || issue.status === newStatus) {
      setDraggedIssueId(null);
      return;
    }

    // Optimistic update
    setIssues(prev => prev.map(i => 
      i.id === issueId ? { ...i, status: newStatus } : i
    ));

    try {
      const response = await fetch(`/api/issues/${issueId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Status changed to ${newStatus.replace('_', ' ').toLowerCase()} via drag-drop`,
          newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(`Moved to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Failed to update issue status:', error);
      // Revert optimistic update
      await fetchIssues();
      toast.error('Failed to update issue status');
    } finally {
      setDraggedIssueId(null);
    }
  };

  const handleSubmitUpdate = async () => {
    if (!selectedIssue) {
      return;
    }

    if (!updateMessage.trim()) {
      toast.error('Please add a brief update before submitting.');
      return;
    }

    try {
      setSubmittingUpdate(true);
      const response = await fetch(`/api/issues/${selectedIssue.id}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: updateMessage.trim(),
          newStatus: updateStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post update');
      }

      toast.success('Workshop update posted');
      setUpdateDialogOpen(false);
      setSelectedIssue(null);
      setUpdateMessage('');
      await fetchIssues();
    } catch (error) {
      console.error(error);
      toast.error('Unable to post update right now.');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  if (loading) {
    return <LoadingPage text="Loading workshop dashboard..." />;
  }

  if (!isAuthenticated || accessLevel !== 'workshop') {
    return null; // Will redirect via useAuth
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-sm dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/workshop" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div className="leading-tight">
                <span className="block text-xs font-semibold uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
                  Workshop
                </span>
                <span className="block text-lg font-bold text-slate-900 dark:text-white">
                  Repair Dashboard
                </span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/schedule">
              <Button className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Schedule</span>
              </Button>
            </Link>
            <ThemeToggle />
            <NotificationBell />
            <div className="hidden md:flex items-center gap-2 rounded-full border-2 border-orange-200/60 bg-orange-50/80 px-4 py-2 dark:border-orange-900/40 dark:bg-orange-900/20">
              <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">{issues.length} issues</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="gap-2 font-semibold">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 space-y-6">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-orange-200/70 bg-gradient-to-r from-orange-50 to-orange-100 px-5 py-2 text-sm font-semibold tracking-wide text-orange-700 shadow-sm dark:border-orange-900/40 dark:from-orange-900/20 dark:to-orange-900/30 dark:text-orange-300">
              <Wrench className="h-4 w-4" />
              Workshop Control Panel
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl dark:text-white">Repair Queue Management</h1>
            <p className="max-w-3xl text-lg text-gray-600 dark:text-gray-300">Track repairs, update job progress, and coordinate with operations for parts and scheduling.</p>
          </div>

          {/* Quick Actions Banner */}
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 dark:text-blue-100">Interactive Calendar View</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Drag & drop to schedule. Click issues to book service slots.</p>
                </div>
              </div>
              <Link href="/schedule">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg">
                  <Calendar className="w-5 h-5" />
                  Open Calendar
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder="Filter by fleet..."
              value={fleetFilter}
              onChange={(e) => setFleetFilter(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>

        <Tabs defaultValue="kanban">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="booking">Book Service</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban">
            <div className="grid md:grid-cols-4 gap-6">
              {(['PENDING', 'IN_PROGRESS', 'SCHEDULED', 'COMPLETED'] as const).map((status) => (
                <Card 
                  key={status} 
                  className={cn(
                    "rounded-2xl transition-all duration-200",
                    dragOverColumn === status && "ring-2 ring-primary ring-offset-2 bg-primary/5"
                  )}
                  onDragOver={(e) => handleDragOver(e, status)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span>
                        {status.replace('_', ' ')}
                        <span className="ml-2 text-muted-foreground">
                          ({getIssuesByStatus(status).length})
                        </span>
                      </span>
                      {dragOverColumn === status && (
                        <span className="text-xs text-primary font-normal">Drop here</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={cn(
                    "space-y-4 max-h-[calc(100vh-24rem)] overflow-y-auto min-h-[100px]",
                    dragOverColumn === status && "bg-primary/5 rounded-lg"
                  )}>
                    {getIssuesByStatus(status).map((issue) => (
                      <div
                        key={issue.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, issue.id)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "cursor-grab active:cursor-grabbing transition-opacity",
                          draggedIssueId === issue.id && "opacity-50"
                        )}
                      >
                        <div className="relative group">
                          <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <IssueCard
                            issue={issue}
                            onSchedule={() => {}}
                            onComment={() => openUpdateDialog(issue)}
                          />
                        </div>
                      </div>
                    ))}
                    {getIssuesByStatus(status).length === 0 && (
                      <p className={cn(
                        "text-sm text-muted-foreground text-center py-8",
                        dragOverColumn === status && "text-primary font-medium"
                      )}>
                        {dragOverColumn === status ? 'Drop to move here' : 'No issues'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <div className="grid gap-6">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Today&apos;s Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getIssuesByStatus('SCHEDULED').map((issue) => (
                      <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{issue.fleetNumber}</h4>
                          <p className="text-sm text-muted-foreground">{issue.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{issue.severity}</p>
                          <p className="text-xs text-muted-foreground">Scheduled</p>
                        </div>
                      </div>
                    ))}
                    {getIssuesByStatus('SCHEDULED').length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No scheduled repairs for today</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="booking">
            <div className="grid gap-6">
              <TruckBooking />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={updateDialogOpen} onOpenChange={(open: boolean) => {
        setUpdateDialogOpen(open);
        if (!open) {
          setSelectedIssue(null);
          setUpdateMessage('');
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Post workshop update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {selectedIssue ? `#${selectedIssue.ticket} • ${selectedIssue.fleetNumber}` : ''}
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-status">Status</Label>
              <Select value={updateStatus} onValueChange={(value: string) => setUpdateStatus(value as Status)}>
                <SelectTrigger id="update-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="COMPLETED">Completed / Ready</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-message">Workshop update</Label>
              <Textarea
                id="update-message"
                placeholder="Share what changed, what was inspected, or if the vehicle is ready to go."
                rows={4}
                value={updateMessage}
                onChange={(event) => setUpdateMessage(event.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setUpdateDialogOpen(false)} disabled={submittingUpdate}>
                Cancel
              </Button>
              <Button onClick={handleSubmitUpdate} disabled={submittingUpdate}>
                {submittingUpdate ? 'Saving...' : 'Post update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <QuickActionsMenu />
    </div>
  );
}

