'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { RefreshCw, CheckCircle, Loader2 } from 'lucide-react';

interface SyncToGearboxProps {
  open: boolean;
  onClose: () => void;
  issue: {
    id: string;
    fleetNumber: string;
    description: string;
    severity: string;
  };
  onSynced?: () => void;
}

export function SyncToGearbox({ open, onClose, issue, onSynced }: SyncToGearboxProps) {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/gearbox/sync-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId: issue.id,
          fleetNumber: issue.fleetNumber,
          description: issue.description,
          severity: issue.severity,
        }),
      });

      if (response.ok) {
        await response.json();
        toast.success('Issue synced to Gearbox successfully');
        setSynced(true);
        onSynced?.();
        setTimeout(() => onClose(), 2000);
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed to sync to Gearbox');
      }
    } catch {
      toast.error('Failed to sync to Gearbox');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sync to Gearbox</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Fleet Number</Label>
            <Input value={issue.fleetNumber} readOnly />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={issue.description} readOnly className="h-20" />
          </div>

          <div className="space-y-2">
            <Label>Severity</Label>
            <Input value={issue.severity} readOnly />
          </div>

          {synced ? (
            <div className="flex items-center justify-center gap-2 text-green-600 py-4">
              <CheckCircle className="h-5 w-5" />
              <span>Successfully synced to Gearbox</span>
            </div>
          ) : (
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={onClose} disabled={syncing}>
                Cancel
              </Button>
              <Button onClick={handleSync} disabled={syncing}>
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync to Gearbox
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
