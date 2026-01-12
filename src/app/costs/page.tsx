'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Plus, Filter, Calendar } from 'lucide-react';

type CostCategory = 'parts' | 'labor' | 'external' | 'other';

interface CostRecord {
  id: string;
  issueId: string | null;
  workOrderId: string | null;
  maintenanceScheduleId: string | null;
  category: CostCategory;
  description: string;
  amount: number;
  currency: string;
  supplier: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CostTotals {
  category: string;
  count: number;
  total: number;
}

const CATEGORY_COLORS: Record<CostCategory, string> = {
  parts: 'bg-blue-500',
  labor: 'bg-green-500',
  external: 'bg-purple-500',
  other: 'bg-gray-500'
};

const CATEGORY_LABELS: Record<CostCategory, string> = {
  parts: 'Parts',
  labor: 'Labor',
  external: 'External',
  other: 'Other'
};

export default function CostsPage() {
  const [costs, setCosts] = useState<CostRecord[]>([]);
  const [filteredCosts, setFilteredCosts] = useState<CostRecord[]>([]);
  const [totals, setTotals] = useState<CostTotals[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    issueId: '',
    workOrderId: '',
    maintenanceScheduleId: '',
    category: 'parts' as CostCategory,
    description: '',
    amount: '',
    currency: 'AUD',
    supplier: '',
    invoiceNumber: '',
    invoiceDate: ''
  });

  useEffect(() => {
    fetchCosts();
  }, []);

  useEffect(() => {
    let filtered = [...costs];

    if (filterCategory !== 'all') {
      filtered = filtered.filter(c => c.category === filterCategory);
    }

    if (filterStartDate) {
      filtered = filtered.filter(c => new Date(c.createdAt) >= new Date(filterStartDate));
    }

    if (filterEndDate) {
      filtered = filtered.filter(c => new Date(c.createdAt) <= new Date(filterEndDate));
    }

    setFilteredCosts(filtered);
  }, [costs, filterCategory, filterStartDate, filterEndDate]);

  const fetchCosts = async () => {
    try {
      const response = await fetch('/api/costs');
      const data = await response.json();
      setCosts(data.costs || []);
      setTotals(data.totals || []);
      setGrandTotal(data.grandTotal || 0);
    } catch (error) {
      console.error('Error fetching cost records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          invoiceDate: formData.invoiceDate ? new Date(formData.invoiceDate).toISOString() : null
        })
      });

      if (response.ok) {
        setIsDialogOpen(false);
        resetForm();
        fetchCosts();
      }
    } catch (error) {
      console.error('Error creating cost record:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      issueId: '',
      workOrderId: '',
      maintenanceScheduleId: '',
      category: 'parts',
      description: '',
      amount: '',
      currency: 'AUD',
      supplier: '',
      invoiceNumber: '',
      invoiceDate: ''
    });
  };

  const deleteCost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cost record?')) return;
    
    try {
      await fetch(`/api/costs/${id}`, {
        method: 'DELETE'
      });
      fetchCosts();
    } catch (error) {
      console.error('Error deleting cost record:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
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
          <h1 className="text-3xl font-bold">Cost Management</h1>
          <p className="text-muted-foreground">Track and manage repair and maintenance costs</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Cost
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Cost Record</DialogTitle>
              <DialogDescription>
                Record a new cost for parts, labor, or external services
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as CostCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parts">Parts</SelectItem>
                    <SelectItem value="labor">Labor</SelectItem>
                    <SelectItem value="external">External Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUD">AUD</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier (optional)</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice # (optional)</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date (optional)</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueId">Related Issue ID (optional)</Label>
                <Input
                  id="issueId"
                  value={formData.issueId}
                  onChange={(e) => setFormData({ ...formData, issueId: e.target.value })}
                  placeholder="Issue ID"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Cost</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(grandTotal)}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        {totals.map((total) => (
          <Card key={total.category}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">{total.category}</CardTitle>
              <Badge className={CATEGORY_COLORS[total.category as CostCategory]}>
                {total.count}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(total.total)}</div>
              <p className="text-xs text-muted-foreground">
                {total.count} record{total.count !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="parts">Parts</SelectItem>
                <SelectItem value="labor">Labor</SelectItem>
                <SelectItem value="external">External</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
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

      {/* Cost Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Records</CardTitle>
          <CardDescription>
            {filteredCosts.length} record{filteredCosts.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-left p-3 font-medium">Supplier</th>
                  <th className="text-right p-3 font-medium">Amount</th>
                  <th className="text-center p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCosts.map((cost) => (
                  <tr key={cost.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(cost.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={CATEGORY_COLORS[cost.category]}>
                        {CATEGORY_LABELS[cost.category]}
                      </Badge>
                    </td>
                    <td className="p-3 max-w-xs truncate" title={cost.description}>
                      {cost.description}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {cost.supplier || '-'}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatCurrency(cost.amount)}
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCost(cost.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCosts.length === 0 && (
            <div className="py-12 text-center">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No cost records found</h3>
              <p className="text-muted-foreground mb-4">
                {filterCategory !== 'all' || filterStartDate || filterEndDate
                  ? 'Try adjusting your filters'
                  : 'Add your first cost record to get started'}
              </p>
              {filterCategory === 'all' && !filterStartDate && !filterEndDate && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Cost
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
