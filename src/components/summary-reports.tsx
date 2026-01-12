'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  Download, 
  Calendar,
  AlertTriangle,
  Clock,
  Truck,
  Loader2,
  Send,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SummaryData {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  overview: {
    totalIssues: number;
    completedCount: number;
    resolutionRate: number;
    avgResolutionHours: number;
  };
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byStatus: {
    pending: number;
    inProgress: number;
    scheduled: number;
    completed: number;
  };
  byCategory: Record<string, number>;
  topFleets: Array<{ fleet: string; count: number }>;
  dailyBreakdown: Array<{
    date: string;
    created: number;
    completed: number;
    critical: number;
  }>;
  highlights: {
    mostCommonCategory: string;
    fleetWithMostIssues: string;
    criticalPercentage: number;
  };
  generatedAt: string;
}

interface SummaryReportsProps {
  className?: string;
}

export function SummaryReports({ className }: SummaryReportsProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reports/summary?period=${period}`);
        if (response.ok) {
          const data = await response.json();
          setSummary(data);
        }
      } catch (error) {
        console.error('Failed to fetch summary:', error);
        toast.error('Failed to load summary report');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [period]);

  const sendEmailReport = async () => {
    try {
      setSending(true);
      const recipients = emailRecipient 
        ? emailRecipient.split(',').map(e => e.trim()).filter(Boolean)
        : [];

      const response = await fetch('/api/reports/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period, recipients })
      });

      if (response.ok) {
        toast.success(`${period} summary report sent successfully!`);
        setEmailRecipient('');
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      console.error('Failed to send report:', error);
      toast.error('Failed to send summary report');
    } finally {
      setSending(false);
    }
  };

  const downloadReport = () => {
    if (!summary) return;

    const content = generateTextReport(summary, period);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `se-repairs-${period}-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  const generateTextReport = (data: SummaryData, periodType: string): string => {
    const periodLabel = periodType.charAt(0).toUpperCase() + periodType.slice(1);
    
    return `
SE REPAIRS ${periodLabel.toUpperCase()} SUMMARY REPORT
Generated: ${new Date(data.generatedAt).toLocaleString()}
Period: ${new Date(data.dateRange.start).toLocaleDateString()} - ${new Date(data.dateRange.end).toLocaleDateString()}

═══════════════════════════════════════════════════════

📊 OVERVIEW
• Total Issues Reported: ${data.overview.totalIssues}
• Issues Completed: ${data.overview.completedCount}
• Resolution Rate: ${data.overview.resolutionRate}%
• Avg Resolution Time: ${data.overview.avgResolutionHours} hours

═══════════════════════════════════════════════════════

🚨 BY SEVERITY
• Critical: ${data.bySeverity.critical}
• High: ${data.bySeverity.high}
• Medium: ${data.bySeverity.medium}
• Low: ${data.bySeverity.low}

═══════════════════════════════════════════════════════

📋 BY STATUS
• Pending: ${data.byStatus.pending}
• In Progress: ${data.byStatus.inProgress}
• Scheduled: ${data.byStatus.scheduled}
• Completed: ${data.byStatus.completed}

═══════════════════════════════════════════════════════

🔧 TOP CATEGORIES
${Object.entries(data.byCategory)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 5)
  .map(([cat, count]) => `• ${cat}: ${count}`)
  .join('\n')}

═══════════════════════════════════════════════════════

🚛 TOP FLEETS (Most Issues)
${data.topFleets.slice(0, 5).map(f => `• ${f.fleet}: ${f.count} issues`).join('\n')}

═══════════════════════════════════════════════════════

💡 HIGHLIGHTS
• Most Common Issue: ${data.highlights.mostCommonCategory}
• Fleet Needing Attention: ${data.highlights.fleetWithMostIssues}
• Critical Issue Rate: ${data.highlights.criticalPercentage}%
    `.trim();
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Summary Report...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Summary Reports
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(v: 'daily' | 'weekly' | 'monthly') => setPeriod(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={downloadReport} disabled={!summary}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {summary && (
          <>
            {/* Date Range */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(summary.dateRange.start).toLocaleDateString()} - {new Date(summary.dateRange.end).toLocaleDateString()}
              </span>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">{summary.overview.totalIssues}</div>
                <div className="text-sm text-muted-foreground">Total Issues</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">{summary.overview.completedCount}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600">{summary.overview.resolutionRate}%</div>
                <div className="text-sm text-muted-foreground">Resolution Rate</div>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg text-center">
                <div className="text-3xl font-bold text-orange-600">{summary.overview.avgResolutionHours}h</div>
                <div className="text-sm text-muted-foreground">Avg Resolution</div>
              </div>
            </div>

            {/* Severity & Status */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* By Severity */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  By Severity
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Critical</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${summary.overview.totalIssues > 0 ? (summary.bySeverity.critical / summary.overview.totalIssues) * 100 : 0}%` }}
                        />
                      </div>
                      <Badge variant="destructive" className="w-8 justify-center">{summary.bySeverity.critical}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${summary.overview.totalIssues > 0 ? (summary.bySeverity.high / summary.overview.totalIssues) * 100 : 0}%` }}
                        />
                      </div>
                      <Badge className="w-8 justify-center bg-orange-500">{summary.bySeverity.high}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: `${summary.overview.totalIssues > 0 ? (summary.bySeverity.medium / summary.overview.totalIssues) * 100 : 0}%` }}
                        />
                      </div>
                      <Badge className="w-8 justify-center bg-yellow-500">{summary.bySeverity.medium}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Low</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${summary.overview.totalIssues > 0 ? (summary.bySeverity.low / summary.overview.totalIssues) * 100 : 0}%` }}
                        />
                      </div>
                      <Badge className="w-8 justify-center bg-green-500">{summary.bySeverity.low}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* By Status */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  By Status
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending</span>
                    <Badge variant="outline">{summary.byStatus.pending}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">In Progress</span>
                    <Badge className="bg-blue-500">{summary.byStatus.inProgress}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Scheduled</span>
                    <Badge className="bg-purple-500">{summary.byStatus.scheduled}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed</span>
                    <Badge className="bg-green-500">{summary.byStatus.completed}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Fleets */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Top Fleets (Most Issues)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {summary.topFleets.slice(0, 5).map((fleet, index) => (
                  <div 
                    key={fleet.fleet}
                    className={cn(
                      "p-3 rounded-lg text-center",
                      index === 0 ? "bg-red-50 dark:bg-red-950/20 border border-red-200" :
                      index === 1 ? "bg-orange-50 dark:bg-orange-950/20 border border-orange-200" :
                      "bg-gray-50 dark:bg-gray-800/50 border"
                    )}
                  >
                    <div className="font-bold">{fleet.fleet}</div>
                    <div className="text-sm text-muted-foreground">{fleet.count} issues</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
              <h4 className="font-medium mb-3">💡 Key Highlights</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Most Common Issue:</span>
                  <div className="font-medium">{summary.highlights.mostCommonCategory}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Fleet Needing Attention:</span>
                  <div className="font-medium">{summary.highlights.fleetWithMostIssues}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Critical Issue Rate:</span>
                  <div className="font-medium">{summary.highlights.criticalPercentage}%</div>
                </div>
              </div>
            </div>

            {/* Email Report */}
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Send Report via Email
              </h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="email@example.com (comma-separated for multiple)"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                  />
                </div>
                <Button onClick={sendEmailReport} disabled={sending}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Report
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Leave empty to send to default management email
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}