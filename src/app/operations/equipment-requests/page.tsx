'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigation } from '@/components/navigation';
import { toast } from 'sonner';
import {
  Package,
  CheckCircle,
  Clock,
  ShoppingCart,
  XCircle,
  AlertCircle,
  Loader2,
  DollarSign,
  ArrowLeft,
  RefreshCw,
  Truck,
} from 'lucide-react';
import { formatMelbourneShort } from '@/lib/time';

interface EquipmentRequest {
  id: string;
  status: string;
  priority: string;
  itemName: string;
  itemDescription: string | null;
  quantity: number;
  estimatedCost: number | null;
  supplier: string | null;
  partNumber: string | null;
  reason: string;
  fleetNumber: string | null;
  urgentReason: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  orderedAt: string | null;
  receivedAt: string | null;
  requestedBy: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
  issue: {
    id: string;
    ticket: number;
    fleetNumber: string;
  } | null;
}

export default function EquipmentRequestsPage() {
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch('/api/equipment-requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to fetch equipment requests:', error);
      toast.error('Failed to load equipment requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateRequestStatus = async (
    requestId: string,
    newStatus: string,
    additionalData?: Record<string, unknown>
  ) => {
    setUpdatingId(requestId);
    try {
      const response = await fetch(`/api/equipment-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ...additionalData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(`Request ${newStatus.toLowerCase()}`);
      await fetchRequests(true);
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    } finally {
      setUpdatingId(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'destructive';
      case 'HIGH':
        return 'default';
      case 'MEDIUM':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'ORDERED':
        return <ShoppingCart className="h-4 w-4" />;
      case 'RECEIVED':
        return <Package className="h-4 w-4" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const approvedRequests = requests.filter((r) => r.status === 'APPROVED');
  const orderedRequests = requests.filter((r) => r.status === 'ORDERED');
  const completedRequests = requests.filter((r) => r.status === 'RECEIVED');

  const renderRequestCard = (request: EquipmentRequest) => (
    <Card key={request.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{request.itemName}</h3>
              <Badge variant={getPriorityColor(request.priority)}>
                {request.priority}
              </Badge>
            </div>
            {request.itemDescription && (
              <p className="text-sm text-muted-foreground">
                {request.itemDescription}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(request.status)}
            <Badge variant="outline">{request.status}</Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {request.quantity > 1 && (
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              Qty: {request.quantity}
            </div>
          )}
          {request.estimatedCost && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${request.estimatedCost.toFixed(2)}
            </div>
          )}
          {request.fleetNumber && (
            <div className="flex items-center gap-1">
              <Truck className="h-3 w-3" />
              Fleet {request.fleetNumber}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Reason:</span>
            <p className="text-muted-foreground mt-1">{request.reason}</p>
          </div>

          {request.urgentReason && (
            <div className="rounded-lg border-2 border-amber-400 bg-amber-50 p-3 dark:border-amber-600 dark:bg-amber-950">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-100 mb-1">
                <AlertCircle className="h-4 w-4" />
                <span className="font-semibold text-xs">URGENT JUSTIFICATION</span>
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-100">
                {request.urgentReason}
              </p>
            </div>
          )}

          {request.partNumber && (
            <div>
              <span className="font-medium">Part #:</span>{' '}
              <span className="text-muted-foreground">{request.partNumber}</span>
            </div>
          )}

          {request.supplier && (
            <div>
              <span className="font-medium">Supplier:</span>{' '}
              <span className="text-muted-foreground">{request.supplier}</span>
            </div>
          )}

          <div className="pt-2 border-t">
            <span className="font-medium">Requested by:</span>{' '}
            <span className="text-muted-foreground">
              {request.requestedBy.name || request.requestedBy.email} (
              {request.requestedBy.role})
            </span>
          </div>

          {request.issue && (
            <div>
              <span className="font-medium">Related Issue:</span>{' '}
              <Link
                href={`/issues/${request.issue.ticket}`}
                className="text-blue-600 hover:underline"
              >
                #{request.issue.ticket}
              </Link>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Created {formatMelbourneShort(request.createdAt)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {request.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                onClick={() => updateRequestStatus(request.id, 'APPROVED')}
                disabled={updatingId === request.id}
                className="gap-1"
              >
                {updatingId === request.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle className="h-3 w-3" />
                )}
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateRequestStatus(request.id, 'CANCELLED')}
                disabled={updatingId === request.id}
                className="gap-1"
              >
                <XCircle className="h-3 w-3" />
                Decline
              </Button>
            </>
          )}

          {request.status === 'APPROVED' && (
            <Button
              size="sm"
              onClick={() => updateRequestStatus(request.id, 'ORDERED')}
              disabled={updatingId === request.id}
              className="gap-1"
            >
              {updatingId === request.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ShoppingCart className="h-3 w-3" />
              )}
              Mark as Ordered
            </Button>
          )}

          {request.status === 'ORDERED' && (
            <Button
              size="sm"
              onClick={() => updateRequestStatus(request.id, 'RECEIVED')}
              disabled={updatingId === request.id}
              className="gap-1"
            >
              {updatingId === request.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Package className="h-3 w-3" />
              )}
              Mark as Received
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navigation />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-4">
            <Link href="/operations">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Equipment Requests
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Review and manage workshop equipment and parts requests
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRequests(true)}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Pending
                    </p>
                    <p className="text-3xl font-bold">{pendingRequests.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Approved
                    </p>
                    <p className="text-3xl font-bold">{approvedRequests.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Ordered
                    </p>
                    <p className="text-3xl font-bold">{orderedRequests.length}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Received
                    </p>
                    <p className="text-3xl font-bold">{completedRequests.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved ({approvedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="ordered" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Ordered ({orderedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <Package className="h-4 w-4" />
              Received ({completedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {pendingRequests.map(renderRequestCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No approved requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {approvedRequests.map(renderRequestCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ordered" className="space-y-4">
            {orderedRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No ordered requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {orderedRequests.map(renderRequestCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No received requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {completedRequests.map(renderRequestCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
