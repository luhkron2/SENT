'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, TrendingDown, AlertCircle, CheckCircle, Plus, Filter, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DriverPerformance {
  id: string;
  driverName: string;
  driverEmail: string | null;
  fleetNumber: string | null;
  periodStart: string;
  periodEnd: string;
  issuesReported: number;
  issuesResolved: number;
  avgResponseTime: number | null;
  safeDrivingScore: number | null;
  fuelEfficiency: number | null;
  onTimeDeliveryRate: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PerformanceStats {
  uniqueDrivers: number;
  totalIssuesReported: number;
  totalIssuesResolved: number;
  avgResponseTime: number;
  avgSafeDrivingScore: number;
  totalRecords: number;
}

export default function DriverPerformancePage() {
  const [records, setRecords] = useState<DriverPerformance[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DriverPerformance[]>([]);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterDriver, setFilterDriver] = useState<string>('');
  const [filterFleet, setFilterFleet] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    driverName: '',
    driverEmail: '',
    fleetNumber: '',
    periodStart: '',
    periodEnd: '',
    issuesReported: '0',
    issuesResolved: '0',
    avgResponseTime: '',
    safeDrivingScore: '',
    fuelEfficiency: '',
    onTimeDeliveryRate: '',
    notes: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    let filtered = [...records];

    if (filterDriver) {
      filtered = filtered.filter(r => 
        r.driverName.toLowerCase().includes(filterDriver.toLowerCase())
      );
    }

    if (filterFleet) {
      filtered = filtered.filter(r => 
        r.fleetNumber?.toLowerCase().includes(filterFleet.toLowerCase())
      );
    }

    if (filterStartDate) {
      filtered = filtered.filter(r => new Date(r.periodStart) >= new Date(filterStartDate));
    }

    if (filterEndDate) {
      filtered = filtered.filter(r => new Date(r.periodStart) <= new Date(filterEndDate));
    }

    setFilteredRecords(filtered);
  }, [records, filterDriver, filterFleet, filterStartDate, filterEndDate]);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/driver-performance');
      const data = await response.json();
      setRecords(data.records || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching driver performance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/driver-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          issuesReported: parseInt(formData.issuesReported) || 0,
          issuesResolved: parseInt(formData.issuesResolved) || 0,
          avgResponseTime: formData.avgResponseTime ? parseFloat(formData.avgResponseTime) : null,
          safeDrivingScore: formData.safeDrivingScore ? parseFloat(formData.safeDrivingScore) : null,
          fuelEfficiency: formData.fuelEfficiency ? parseFloat(formData.fuelEfficiency) : null,
          onTimeDeliveryRate: formData.onTimeDeliveryRate ? parseFloat(formData.onTimeDeliveryRate) : null,
          periodStart: new Date(formData.periodStart).toISOString(),
          periodEnd: new Date(formData.periodEnd).toISOString()
        })
      });

      if (response.ok) {
        setIsDialogOpen(false);
        resetForm();
        fetchRecords();
      }
    } catch (error) {
      console.error('Error creating performance record:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      driverName: '',
      driverEmail: '',
      fleetNumber: '',
      periodStart: '',
      periodEnd: '',
      issuesReported: '0',
      issuesResolved: '0',
      avgResponseTime: '',
      safeDrivingScore: '',
      fuelEfficiency: '',
      onTimeDeliveryRate: '',
      notes: ''
    });
  };

  const deleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this performance record?')) return;
    
    try {
      await fetch(`/api/driver-performance/${id}`, {
        method: 'DELETE'
      });
      fetchRecords();
    } catch (error) {
      console.error('Error deleting performance record:', error);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'bg-gray-500';
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number | null) => {
    if (score === null) return 'N/A';
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
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
          <h1 className="text-3xl font-bold">Driver Performance</h1>
          <p className="text-muted-foreground">Track driver metrics and safety scores</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Performance Record</DialogTitle>
              <DialogDescription>
                Record driver performance metrics for a specific period
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driverName">Driver Name *</Label>
                  <Input
                    id="driverName"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driverEmail">Driver Email</Label>
                  <Input
                    id="driverEmail"
                    type="email"
                    value={formData.driverEmail}
                    onChange={(e) => setFormData({ ...formData, driverEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fleetNumber">Fleet Number</Label>
                  <Input
                    id="fleetNumber"
                    value={formData.fleetNumber}
                    onChange={(e) => setFormData({ ...formData, fleetNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodStart">Period Start *</Label>
                  <Input
                    id="periodStart"
                    type="date"
                    value={formData.periodStart}
                    onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodEnd">Period End *</Label>
                  <Input
                    id="periodEnd"
                    type="date"
                    value={formData.periodEnd}
                    onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issuesReported">Issues Reported</Label>
                  <Input
                    id="issuesReported"
                    type="number"
                    value={formData.issuesReported}
                    onChange={(e) => setFormData({ ...formData, issuesReported: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuesResolved">Issues Resolved</Label>
                  <Input
                    id="issuesResolved"
                    type="number"
                    value={formData.issuesResolved}
                    onChange={(e) => setFormData({ ...formData, issuesResolved: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="avgResponseTime">Avg Response Time (min)</Label>
                  <Input
                    id="avgResponseTime"
                    type="number"
                    step="0.1"
                    value={formData.avgResponseTime}
                    onChange={(e) => setFormData({ ...formData, avgResponseTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="safeDrivingScore">Safe Driving Score (0-100)</Label>
                  <Input
                    id="safeDrivingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.safeDrivingScore}
                    onChange={(e) => setFormData({ ...formData, safeDrivingScore: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelEfficiency">Fuel Efficiency (km/L)</Label>
                  <Input
                    id="fuelEfficiency"
                    type="number"
                    step="0.1"
                    value={formData.fuelEfficiency}
                    onChange={(e) => setFormData({ ...formData, fuelEfficiency: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="onTimeDeliveryRate">On-Time Delivery Rate (%)</Label>
                  <Input
                    id="onTimeDeliveryRate"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.onTimeDeliveryRate}
                    onChange={(e) => setFormData({ ...formData, onTimeDeliveryRate: e.target.value })}
                  />
                </div>
                <div className="space-y-2"></div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Record</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Drivers</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueDrivers}</div>
              <p className="text-xs text-muted-foreground">
                Tracked drivers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalIssuesReported}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalIssuesResolved} resolved ({stats.totalIssuesReported > 0 
                  ? Math.round((stats.totalIssuesResolved / stats.totalIssuesReported) * 100) 
                  : 0}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgResponseTime ? `${stats.avgResponseTime.toFixed(1)} min` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Safety Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgSafeDrivingScore ? `${stats.avgSafeDrivingScore.toFixed(1)}/100` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Driver safety rating
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Input
              placeholder="Filter by driver..."
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
              className="w-48"
            />
            <Input
              placeholder="Filter by fleet..."
              value={filterFleet}
              onChange={(e) => setFilterFleet(e.target.value)}
              className="w-48"
            />
            <Input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-40"
            />
            <Input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Records */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{record.driverName}</CardTitle>
                  <CardDescription>
                    {record.fleetNumber || 'No fleet assigned'}
                  </CardDescription>
                </div>
                <Badge className={getScoreColor(record.safeDrivingScore)}>
                  {getScoreLabel(record.safeDrivingScore)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(record.periodStart).toLocaleDateString()} - {new Date(record.periodEnd).toLocaleDateString()}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Issues</div>
                  <div className="text-lg font-semibold">
                    {record.issuesReported} / {record.issuesResolved}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                  <div className="text-lg font-semibold">
                    {record.avgResponseTime ? `${record.avgResponseTime} min` : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Safety Score</div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold">
                      {record.safeDrivingScore ? `${record.safeDrivingScore}/100` : 'N/A'}
                    </div>
                    {record.safeDrivingScore !== null && (
                      <div className={cn(
                        'h-2 w-2 rounded-full',
                        getScoreColor(record.safeDrivingScore)
                      )} />
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Fuel Efficiency</div>
                  <div className="text-lg font-semibold">
                    {record.fuelEfficiency ? `${record.fuelEfficiency} km/L` : 'N/A'}
                  </div>
                </div>
              </div>

              {record.onTimeDeliveryRate !== null && (
                <div>
                  <div className="text-sm text-muted-foreground">On-Time Delivery</div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold">
                      {record.onTimeDeliveryRate}%
                    </div>
                    <div className={cn(
                      'h-2 w-2 rounded-full',
                      record.onTimeDeliveryRate >= 90 ? 'bg-green-500' :
                      record.onTimeDeliveryRate >= 75 ? 'bg-blue-500' :
                      record.onTimeDeliveryRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    )} />
                  </div>
                </div>
              )}

              {record.notes && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Notes:</span> {record.notes}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteRecord(record.id)}
                className="w-full text-destructive hover:text-destructive"
              >
                Delete Record
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No performance records found</h3>
            <p className="text-muted-foreground mb-4">
              {filterDriver || filterFleet || filterStartDate || filterEndDate
                ? 'Try adjusting your filters'
                : 'Add your first performance record to get started'}
            </p>
            {!filterDriver && !filterFleet && !filterStartDate && !filterEndDate && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Record
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
