'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface WorkOrder {
  id: string;
  status: string;
  startAt: string;
  endAt: string;
  workshopSite: string | null;
  workType: string | null;
  notes: string | null;
  createdAt: string;
  issue: {
    ticket: number;
    fleetNumber: string;
    category: string;
    severity: string;
  };
  assignedTo: {
    name: string | null;
  } | null;
}

export default function AdminWorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workorders');
      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data);
      } else {
        toast.error('Failed to load work orders');
      }
    } catch (error) {
      console.error('Failed to fetch work orders:', error);
      toast.error('Failed to load work orders');
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work order?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workorders/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Work order deleted');
        fetchWorkOrders();
      } else {
        toast.error('Failed to delete work order');
      }
    } catch (error) {
      console.error('Failed to delete work order:', error);
      toast.error('Failed to delete work order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      case 'scheduled': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading work orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Work Orders Management</h1>
          <p className="text-muted-foreground">{workOrders.length} total work orders</p>
        </div>
      </div>

      <div className="space-y-4">
        {workOrders.map((wo) => (
          <Card key={wo.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(wo.status)}>
                      {wo.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">Issue #{wo.issue.ticket}</Badge>
                    <Badge variant="outline">{wo.issue.category}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Fleet:</span> {wo.issue.fleetNumber}
                    </div>
                    <div>
                      <span className="font-semibold">Workshop:</span> {wo.workshopSite || 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold">Assigned:</span> {wo.assignedTo?.name || 'Unassigned'}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(wo.startAt).toLocaleString()} - {new Date(wo.endAt).toLocaleString()}
                    </div>
                  </div>

                  {wo.workType && (
                    <div className="text-sm">
                      <span className="font-semibold">Work Type:</span> {wo.workType}
                    </div>
                  )}

                  {wo.notes && (
                    <p className="text-sm text-muted-foreground">{wo.notes}</p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Link href={`/issues/${wo.issue.ticket}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteWorkOrder(wo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {workOrders.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No work orders found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}