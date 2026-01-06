'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Package, Loader2, AlertCircle } from 'lucide-react';

const equipmentRequestSchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  itemDescription: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  estimatedCost: z.string().optional(),
  supplier: z.string().optional(),
  partNumber: z.string().optional(),
  reason: z.string().min(10, 'Please provide a reason (at least 10 characters)'),
  fleetNumber: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  urgentReason: z.string().optional(),
}).refine(
  (data) => {
    if (data.priority === 'URGENT' && !data.urgentReason) {
      return false;
    }
    return true;
  },
  {
    message: 'Urgent reason is required for URGENT priority',
    path: ['urgentReason'],
  }
);

type EquipmentRequestFormData = z.infer<typeof equipmentRequestSchema>;

interface EquipmentRequestFormProps {
  issueId?: string;
  issueTicket?: number;
  fleetNumber?: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function EquipmentRequestForm({
  issueId,
  issueTicket,
  fleetNumber,
  onSuccess,
  trigger,
}: EquipmentRequestFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<EquipmentRequestFormData>({
    resolver: zodResolver(equipmentRequestSchema),
    defaultValues: {
      quantity: 1,
      priority: 'MEDIUM',
      fleetNumber: fleetNumber || '',
    },
  });

  const priority = watch('priority');

  const onSubmit = async (data: EquipmentRequestFormData) => {
    setLoading(true);

    try {
      const response = await fetch('/api/equipment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          issueId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create equipment request');
      }

      toast.success('Equipment request submitted!', {
        description: 'Operations team has been notified.',
      });

      reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting equipment request:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit request'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Package className="h-4 w-4" />
            Request Equipment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Request Equipment/Parts
          </DialogTitle>
          <DialogDescription>
            {issueTicket
              ? `Flag equipment needed for Issue #${issueTicket}${fleetNumber ? ` (Fleet ${fleetNumber})` : ''}`
              : 'Submit a request for equipment or parts needed in the workshop'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="itemName">
              Item/Part Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="itemName"
              {...register('itemName')}
              placeholder="e.g., Brake Pads, Air Filter, Impact Wrench"
            />
            {errors.itemName && (
              <p className="text-sm text-destructive">{errors.itemName.message}</p>
            )}
          </div>

          {/* Item Description */}
          <div className="space-y-2">
            <Label htmlFor="itemDescription">Description/Specifications</Label>
            <Textarea
              id="itemDescription"
              {...register('itemDescription')}
              rows={2}
              placeholder="Size, model, specifications, or additional details..."
            />
          </div>

          {/* Quantity and Cost */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                {...register('quantity', { valueAsNumber: true })}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Estimated Cost (AUD)</Label>
              <Input
                id="estimatedCost"
                type="number"
                step="0.01"
                min="0"
                {...register('estimatedCost')}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Supplier and Part Number */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supplier">Preferred Supplier</Label>
              <Input
                id="supplier"
                {...register('supplier')}
                placeholder="e.g., Repco, Supercheap Auto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partNumber">Part/SKU Number</Label>
              <Input
                id="partNumber"
                {...register('partNumber')}
                placeholder="If known"
              />
            </div>
          </div>

          {/* Fleet Number */}
          {!fleetNumber && (
            <div className="space-y-2">
              <Label htmlFor="fleetNumber">Related Fleet Number</Label>
              <Input
                id="fleetNumber"
                {...register('fleetNumber')}
                placeholder="If applicable"
              />
            </div>
          )}

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">
              Priority <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low - Can wait</SelectItem>
                    <SelectItem value="MEDIUM">Medium - Standard request</SelectItem>
                    <SelectItem value="HIGH">High - Needed soon</SelectItem>
                    <SelectItem value="URGENT">Urgent - Blocking work</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Request <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              {...register('reason')}
              rows={3}
              placeholder="Why is this equipment/part needed? What repair or task requires it?"
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>

          {/* Urgent Reason (conditional) */}
          {priority === 'URGENT' && (
            <div className="space-y-2 rounded-lg border-2 border-amber-400 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-950">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <AlertCircle className="h-4 w-4" />
                <Label htmlFor="urgentReason" className="text-sm font-semibold">
                  Urgent Justification <span className="text-destructive">*</span>
                </Label>
              </div>
              <Textarea
                id="urgentReason"
                {...register('urgentReason')}
                rows={2}
                placeholder="Explain why this is URGENT and blocking work..."
                className="bg-white dark:bg-slate-900"
              />
              {errors.urgentReason && (
                <p className="text-sm text-destructive">
                  {errors.urgentReason.message}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
