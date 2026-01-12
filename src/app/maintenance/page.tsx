'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Clock, CheckCircle, Wrench, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'PREDICTIVE' | 'INSPECTION';
type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface MaintenanceSchedule {
  id: string;
  fleetNumber: string;
  title: string;
  description: string | null;
  type: MaintenanceType;
  status: MaintenanceStatus;
  scheduledAt: string;
  completedAt: string | null;
  assignedTo: { id: string; name: string | null; email: string | null } | null;
  priority: Severity;
  estimatedHours: number | null;
  actualHours: number | null;
  cost: number | null;
  notes: string | null;
  recurring: boolean;
  recurringInterval: string | null;
  tasks: Array<{
    id: string;
    name: string;
    description: string | null;
    completed: boolean;
    completedAt: string | null;
  }>;
}

const STATUS_COLORS: Record<MaintenanceStatus, string> = {
  SCHEDULED: 'bg-blue-500',
  IN_PROGRESS: 'bg-yellow-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-gray-500',
  OVERDUE: 'bg-red-500'
};

const STATUS_LABELS: Record<MaintenanceStatus, string> = {
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  OVERDUE: 'Overdue'
};

const PRIORITY_COLORS: Record<Severity, string> = {
  LOW: 'bg-gray-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500'
};

export default function MaintenancePage() {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterFleet, setFilterFleet] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    fleetNumber: '',
    title: '',
    description: '',
    type: 'PREVENTIVE' as MaintenanceType,
    priority: 'MEDIUM' as Severity,
    scheduledAt: '',
    estimatedHours: '',
    cost: '',
    recurring: false,
    recurringInterval: 'monthly' as string,
    tasks: [{ name: '', description: '' }]
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    let filtered = [...schedules];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(s => s.type === filterType);
    }

    if (filterFleet) {
      filtered = filtered.filter(s => 
        s.fleetNumber.toLowerCase().includes(filterFleet.toLowerCase())
      );
    }

    setFilteredSchedules(filtered);
  }, [schedules, filterStatus, filterType, filterFleet]);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/maintenance');
      const data = await response.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Error fetching maintenance schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scheduledAt: new Date(formData.scheduledAt).toISOString(),
          estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          tasks: formData.tasks.filter(t => t.name.trim())
        })
      });

      if (response.ok) {
        setIsDialogOpen(false);
        resetForm();
        fetchSchedules();
      }
    } catch (error) {
      console.error('Error creating maintenance schedule:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      fleetNumber: '',
      title: '',
      description: '',
      type: 'PREVENTIVE',
      priority: 'MEDIUM',
      scheduledAt: '',
      estimatedHours: '',
      cost: '',
      recurring: false,
      recurringInterval: 'monthly',
      tasks: [{ name: '', description: '' }]
    });
  };

  const addTask = () => {
    setFormData({
      ...formData,
      tasks: [...formData.tasks, { name: '', description: '' }]
    });
  };

  const updateTask = (index: number, field: 'name' | 'description', value: string) => {
    const newTasks = [...formData.tasks];
    if (newTasks[index]) {
      newTasks[index][field] = value;
    }
    setFormData({ ...formData, tasks: newTasks });
  };

  const removeTask = (index: number) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.filter((_, i) => i !== index)
    });
  };

  const updateStatus = async (id: string, status: MaintenanceStatus) => {
    try {
      await fetch(`/api/maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const isOverdue = (scheduledAt: string, status: MaintenanceStatus) => {
    return new Date(scheduledAt) < new Date() && status === 'SCHEDULED';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Schedule</h1>
          <p className="text-muted-foreground">Manage preventive and corrective maintenance</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Maintenance Schedule</DialogTitle>
              <DialogDescription>
                Schedule preventive or corrective maintenance for a fleet unit
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fleetNumber">Fleet Number</Label>
                  <Input
                    id="fleetNumber"
                    value={formData.fleetNumber}
                    onChange={(e) => setFormData({ ...formData, fleetNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as MaintenanceType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                      <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                      <SelectItem value="PREDICTIVE">Predictive</SelectItem>
                      <SelectItem value="INSPECTION">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Scheduled Date</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as Severity })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Est. Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Estimated Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.recurring}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="recurring">Recurring Schedule</Label>
                {formData.recurring && (
                  <Select
                    value={formData.recurringInterval}
                    onValueChange={(value) => setFormData({ ...formData, recurringInterval: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Tasks</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addTask}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </Button>
                </div>
                {formData.tasks.map((task, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Task name"
                      value={task.name}
                      onChange={(e) => updateTask(index, 'name', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={task.description}
                      onChange={(e) => updateTask(index, 'description', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTask(index)}
                      disabled={formData.tasks.length === 1}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Schedule</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                <SelectItem value="PREDICTIVE">Predictive</SelectItem>
                <SelectItem value="INSPECTION">Inspection</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by fleet..."
              value={filterFleet}
              onChange={(e) => setFilterFleet(e.target.value)}
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Schedules Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSchedules.map((schedule) => (
          <Card key={schedule.id} className={cn(
            "transition-all hover:shadow-lg",
            isOverdue(schedule.scheduledAt, schedule.status) && "border-red-500"
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{schedule.title}</CardTitle>
                  <CardDescription className="mt-1">{schedule.fleetNumber}</CardDescription>
                </div>
                <Badge className={cn(STATUS_COLORS[schedule.status])}>
                  {isOverdue(schedule.scheduledAt, schedule.status) ? 'Overdue' : STATUS_LABELS[schedule.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(schedule.scheduledAt).toLocaleDateString()} at{' '}
                {new Date(schedule.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn(PRIORITY_COLORS[schedule.priority], 'text-white')}>
                  {schedule.priority}
                </Badge>
                <Badge variant="outline">{schedule.type}</Badge>
                {schedule.recurring && (
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {schedule.recurringInterval}
                  </Badge>
                )}
              </div>

              {schedule.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {schedule.description}
                </p>
              )}

              {schedule.tasks && schedule.tasks.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Tasks</div>
                  <div className="space-y-1">
                    {schedule.tasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center gap-2 text-sm">
                        {task.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                        )}
                        <span className={cn(task.completed && 'line-through text-muted-foreground')}>
                          {task.name}
                        </span>
                      </div>
                    ))}
                    {schedule.tasks.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        +{schedule.tasks.length - 3} more tasks
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(schedule.estimatedHours || schedule.cost) && (
                <div className="flex gap-4 text-sm">
                  {schedule.estimatedHours && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {schedule.estimatedHours}h
                    </div>
                  )}
                  {schedule.cost && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">${schedule.cost}</span>
                    </div>
                  )}
                </div>
              )}

              {schedule.status === 'SCHEDULED' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => updateStatus(schedule.id, 'IN_PROGRESS')}
                  >
                    <Wrench className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => updateStatus(schedule.id, 'COMPLETED')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSchedules.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No maintenance schedules found</h3>
            <p className="text-muted-foreground mb-4">
              {filterStatus !== 'all' || filterType !== 'all' || filterFleet
                ? 'Try adjusting your filters'
                : 'Create your first maintenance schedule to get started'}
            </p>
            {filterStatus === 'all' && filterType === 'all' && !filterFleet && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Schedule
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
