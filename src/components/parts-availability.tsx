'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Clock, 
  DollarSign, 
  Truck, 
  AlertTriangle, 
  CheckCircle2,
  ShoppingCart,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PartsInfo {
  available: boolean;
  category?: string;
  stock: number;
  leadTime: string;
  supplier: string;
  estimatedCost: number;
  commonParts: string[];
  orderRequired?: boolean;
  alternativeSupplier?: string;
  recommendations: string[];
  location?: string;
}

interface PartsAvailabilityProps {
  category: string;
  onPartsStatusChange?: (available: boolean, info: PartsInfo) => void;
  className?: string;
}

export function PartsAvailability({ category, onPartsStatusChange, className }: PartsAvailabilityProps) {
  const [partsInfo, setPartsInfo] = useState<PartsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  const checkPartsAvailability = useCallback(async () => {
    if (!category) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/inventory/check?category=${encodeURIComponent(category)}`);
      if (response.ok) {
        const data = await response.json();
        setPartsInfo(data);
        if (onPartsStatusChange) {
          onPartsStatusChange(data.available, data);
        }
      }
    } catch (error) {
      console.error('Failed to check parts availability:', error);
    } finally {
      setLoading(false);
    }
  }, [category, onPartsStatusChange]);

  useEffect(() => {
    if (category) {
      checkPartsAvailability();
    }
  }, [category, checkPartsAvailability]);

  const handleOrderParts = async () => {
    if (!partsInfo) return;
    
    setOrdering(true);
    // Simulate ordering process
    setTimeout(() => {
      setOrdering(false);
      // Update parts info to show order placed
      setPartsInfo(prev => prev ? {
        ...prev,
        orderRequired: false,
        leadTime: '24-48 hours',
        recommendations: ['Order placed successfully', 'Parts will arrive within 48 hours']
      } : null);
    }, 2000);
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-4">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!partsInfo) {
    return (
      <Card className={cn("border-gray-200", className)}>
        <CardContent className="p-4 text-center text-muted-foreground">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Unable to check parts availability</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border-2 transition-all",
      partsInfo.available 
        ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20" 
        : "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-5 w-5" />
            Parts Availability - {category}
          </CardTitle>
          <Badge 
            variant={partsInfo.available ? "default" : "destructive"}
            className="gap-1"
          >
            {partsInfo.available ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertTriangle className="h-3 w-3" />
            )}
            {partsInfo.available ? 'In Stock' : 'Order Required'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stock Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Stock:</span>
            <span className={cn(
              "font-bold",
              partsInfo.stock > 5 ? "text-green-600" : partsInfo.stock > 0 ? "text-yellow-600" : "text-red-600"
            )}>
              {partsInfo.stock} units
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Lead Time:</span>
            <span className="font-bold">{partsInfo.leadTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Est. Cost:</span>
            <span className="font-bold">${partsInfo.estimatedCost}</span>
          </div>

          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Supplier:</span>
            <span className="font-bold truncate">{partsInfo.supplier}</span>
          </div>
        </div>

        {/* Location */}
        {partsInfo.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Location:</span>
            <span>{partsInfo.location}</span>
          </div>
        )}

        {/* Common Parts */}
        {partsInfo.commonParts && partsInfo.commonParts.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Common Parts for {category}:</p>
            <div className="flex flex-wrap gap-1">
              {partsInfo.commonParts.slice(0, 4).map((part) => (
                <Badge key={part} variant="outline" className="text-xs">
                  {part}
                </Badge>
              ))}
              {partsInfo.commonParts.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{partsInfo.commonParts.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {partsInfo.recommendations && partsInfo.recommendations.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recommendations:</p>
            <ul className="space-y-1">
              {partsInfo.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alternative Supplier */}
        {partsInfo.alternativeSupplier && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Alternative:</span> {partsInfo.alternativeSupplier}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkPartsAvailability}
            disabled={loading}
            className="flex-1"
          >
            <Package className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          {partsInfo.orderRequired && (
            <Button
              size="sm"
              onClick={handleOrderParts}
              disabled={ordering}
              className="flex-1"
            >
              {ordering ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Ordering...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Order Parts
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}