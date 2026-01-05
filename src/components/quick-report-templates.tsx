'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  AlertTriangle,
  Wrench,
  Droplet,
  Wind,
  ThermometerSnowflake,
  CircuitBoard,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export interface QuickTemplate {
  id: string;
  title: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  icon: typeof AlertTriangle;
  color: string;
  safeToContinue: 'Yes' | 'No' | 'Unsure';
}

const templates: QuickTemplate[] = [
  {
    id: 'engine-warning',
    title: 'Engine Warning Light',
    category: 'Mechanical',
    severity: 'HIGH',
    description: 'Engine warning light is illuminated on dashboard. The vehicle is running but needs inspection before continuing operations.',
    icon: AlertTriangle,
    color: 'from-amber-500 to-orange-500',
    safeToContinue: 'Unsure',
  },
  {
    id: 'brake-issue',
    title: 'Brake Performance',
    category: 'Brakes',
    severity: 'CRITICAL',
    description: 'Brakes are not responding properly. Experiencing reduced braking force or unusual noises when braking. Vehicle should not be driven.',
    icon: AlertTriangle,
    color: 'from-red-500 to-rose-600',
    safeToContinue: 'No',
  },
  {
    id: 'air-leak',
    title: 'Air System Leak',
    category: 'Mechanical',
    severity: 'HIGH',
    description: 'Hearing air hissing from air system. PSI drops faster than normal. Need inspection of glad hands, airlines, and brake chambers.',
    icon: Wind,
    color: 'from-blue-400 to-cyan-500',
    safeToContinue: 'Unsure',
  },
  {
    id: 'coolant-leak',
    title: 'Coolant/Fluid Leak',
    category: 'Mechanical',
    severity: 'HIGH',
    description: 'Noticed fluid leaking underneath the vehicle. Appears to be coolant or oil. Needs immediate inspection to prevent engine damage.',
    icon: Droplet,
    color: 'from-emerald-500 to-teal-500',
    safeToContinue: 'No',
  },
  {
    id: 'electrical-fault',
    title: 'Electrical Issue',
    category: 'Electrical',
    severity: 'MEDIUM',
    description: 'Experiencing electrical problems: lights flickering, dashboard warnings intermittent, or electrical accessories not working properly.',
    icon: CircuitBoard,
    color: 'from-purple-500 to-indigo-500',
    safeToContinue: 'Yes',
  },
  {
    id: 'tire-damage',
    title: 'Tire Damage/Wear',
    category: 'Tyres',
    severity: 'HIGH',
    description: 'Noticed unusual tire wear, damage, or low pressure. Tire needs inspection or replacement before further operation.',
    icon: Zap,
    color: 'from-slate-600 to-gray-700',
    safeToContinue: 'No',
  },
  {
    id: 'ac-heating',
    title: 'AC/Heating Fault',
    category: 'Electrical',
    severity: 'LOW',
    description: 'Air conditioning or heating system not working properly. Affecting driver comfort but vehicle is safe to operate.',
    icon: ThermometerSnowflake,
    color: 'from-sky-400 to-blue-500',
    safeToContinue: 'Yes',
  },
  {
    id: 'body-damage',
    title: 'Body/Panel Damage',
    category: 'Body',
    severity: 'MEDIUM',
    description: 'Minor body damage, scratches, dents, or panel issues. Does not affect vehicle operation but needs documentation and repair.',
    icon: Wrench,
    color: 'from-yellow-500 to-amber-500',
    safeToContinue: 'Yes',
  },
];

interface QuickReportTemplatesProps {
  onSelectTemplate: (template: QuickTemplate) => void;
  className?: string;
}

export function QuickReportTemplates({
  onSelectTemplate,
  className = '',
}: QuickReportTemplatesProps) {
  const handleSelectTemplate = (template: QuickTemplate) => {
    onSelectTemplate(template);
    toast.success(`Template applied: ${template.title}`, {
      description: 'You can still edit the details before submitting',
    });
  };

  return (
    <Card className={`rounded-3xl border-2 border-slate-200/80 bg-white/95 shadow-xl backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/80 ${className}`}>
      <CardHeader className="space-y-3 border-b border-slate-200/70 p-6 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Quick Templates
            </CardTitle>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Select a pre-filled template to save time
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((template) => {
            const IconComponent = template.icon;
            return (
              <Button
                key={template.id}
                variant="outline"
                className="group relative h-auto overflow-hidden rounded-2xl border-2 border-slate-200/70 bg-white p-4 text-left transition-all hover:border-blue-400 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-blue-500"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="absolute right-0 top-0 h-24 w-24 opacity-5 transition-opacity group-hover:opacity-10">
                  <div
                    className={`h-full w-full bg-gradient-to-br ${template.color} blur-2xl`}
                  />
                </div>
                <div className="relative space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${template.color} shadow-md transition-transform group-hover:scale-110`}
                    >
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <Badge
                      variant={
                        template.severity === 'CRITICAL'
                          ? 'destructive'
                          : template.severity === 'HIGH'
                            ? 'default'
                            : template.severity === 'MEDIUM'
                              ? 'secondary'
                              : 'outline'
                      }
                      className="text-xs"
                    >
                      {template.severity}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {template.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {template.category}
                    </p>
                  </div>
                  <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {template.description}
                  </p>
                </div>
              </Button>
            );
          })}
        </div>
        <div className="mt-4 rounded-xl border border-blue-200/70 bg-blue-50/70 p-4 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-100">
          <p className="font-medium">💡 Quick Tip</p>
          <p className="mt-1 text-xs">
            Templates pre-fill common issues to save time. You can always edit the
            details before submitting your report.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
