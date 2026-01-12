'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Issue {
  id: string;
  ticket: number;
  status: string;
  severity: string;
  category: string;
  description: string;
  safeToContinue: string | null;
  location: string | null;
  fleetNumber: string;
  primeRego: string | null;
  driverName: string;
  driverPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminIssuesPage() {
  const searchParams = useSearchParams();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '',
    severity: '',
    category: '',
    description: '',
  });

  // Set initial filters from URL parameters
  useEffect(() => {
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const category = searchParams.get('category');
    const fleet = searchParams.get('fleet');
    const driver = searchParams.get('driver');

    if (status) setStatusFilter(status);
    if (severity) setSeverityFilter(severity);
    if (category) setCategoryFilter(category);
    if (fleet) setSearchTerm(fleet);
    if (driver) setSearchTerm(driver);
  }, [searchParams]);

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    let filtered = [...issues];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(issue => 
        issue.ticket.toString().includes(searchTerm) ||
        issue.fleetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }

    // Severity filter
    if (severityFilter !== 'ALL') {
      filtered = filtered.filter(issue => issue.severity === severityFilter);
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(issue => issue.category === categoryFilter);
    }

    setFilteredIssues(filtered);
  }, [issues, searchTerm, statusFilter, severityFilter, categoryFilter]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/issues');
      if (response.ok) {
        const data = await response.json();
        setIssues(data);
      } else {
        toast.error('Failed to load issues');
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (issue: Issue) => {
    setSelectedIssue(issue);
    setEditForm({
      status: issue.status,
      severity: issue.severity,
      category: issue.category,
      description: issue.description,
    });
    setIsEditDialogOpen(true);
  };

  const updateIssue = async () => {
    if (!selectedIssue) return;

    try {
      const response = await fetch(`/api/issues/${selectedIssue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast.success('Issue updated successfully');
        setIsEditDialogOpen(false);
        fetchIssues();
      } else {
        toast.error('Failed to update issue');
      }
    } catch (error) {
      console.error('Failed to update issue:', error);
      toast.error('Failed to update issue');
    }
  };

  const deleteIssue = async (issueId: string, ticket: number) => {
    if (!confirm(`Are you sure you want to delete issue #${ticket}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Issue deleted successfully');
        fetchIssues();
      } else {
        toast.error('Failed to delete issue');
      }
    } catch (error) {
      console.error('Failed to delete issue:', error);
      toast.error('Failed to delete issue');
    }
  };

  const exportIssues = () => {
    const csv = [
      ['Ticket', 'Status', 'Severity', 'Category', 'Fleet', 'Driver', 'Location', 'Created', 'Description'].join(','),
      ...filteredIssues.map(issue => [
        issue.ticket,
        issue.status,
        issue.severity,
        issue.category,
        issue.fleetNumber,
        issue.driverName,
        issue.location || 'N/A',
        new Date(issue.createdAt).toLocaleDateString(),
        `"${issue.description.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `issues-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Issues exported successfully');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      case 'scheduled': return 'bg-purple-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading issues...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Issue Management</h1>
            <p className="text-muted-foreground">
              {filteredIssues.length} of {issues.length} issues
            </p>
          </div>
        </div>
        <Button onClick={exportIssues} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Severities</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="Engine">Engine</SelectItem>
                <SelectItem value="Brakes">Brakes</SelectItem>
                <SelectItem value="Transmission">Transmission</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Suspension">Suspension</SelectItem>
                <SelectItem value="Tires">Tires</SelectItem>
                <SelectItem value="Body">Body</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setSeverityFilter('ALL');
                setCategoryFilter('ALL');
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => (
          <Card key={issue.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className={getSeverityColor(issue.severity)}>
                      #{issue.ticket}
                    </Badge>
                    <Badge className={getStatusColor(issue.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(issue.status)}
                        {issue.status.replace('_', ' ')}
                      </span>
                    </Badge>
                    <Badge variant="outline">{issue.category}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Fleet:</span> {issue.fleetNumber}
                      {issue.primeRego && <span className="text-muted-foreground"> ({issue.primeRego})</span>}
                    </div>
                    <div>
                      <span className="font-semibold">Driver:</span> {issue.driverName}
                      {issue.driverPhone && <span className="text-muted-foreground"> • {issue.driverPhone}</span>}
                    </div>
                    <div>
                      <span className="font-semibold">Location:</span> {issue.location || 'N/A'}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {issue.description}
                  </p>

                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(issue.createdAt).toLocaleString()} • 
                    Updated: {new Date(issue.updatedAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link href={`/issues/${issue.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(issue)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteIssue(issue.id, issue.ticket)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredIssues.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No issues found matching your filters
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Issue #{selectedIssue?.ticket}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={editForm.severity} onValueChange={(value) => setEditForm({ ...editForm, severity: value })}>
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
              <Label>Category</Label>
              <Input
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={updateIssue} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}