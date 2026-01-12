import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

interface SummaryReport {
  generatedAt: string;
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
  highlights: {
    mostCommonCategory: string;
    fleetWithMostIssues: string;
    criticalPercentage: number;
  };
}

const querySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validated = querySchema.parse({
      period: searchParams.get('period') || 'weekly',
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate')
    });

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (validated.period) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    // Override with custom dates if provided
    if (validated.startDate) {
      startDate = new Date(validated.startDate);
    }
    if (validated.endDate) {
      endDate = new Date(validated.endDate);
    }

    // Fetch issues in date range
    const issues = await prisma.issue.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        workOrders: true,
        comments: true
      }
    });

    // Fetch completed issues in date range
    const completedIssues = await prisma.issue.findMany({
      where: {
        status: 'COMPLETED',
        updatedAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Calculate statistics
    const totalIssues = issues.length;
    const criticalIssues = issues.filter(i => i.severity === 'CRITICAL').length;
    const highIssues = issues.filter(i => i.severity === 'HIGH').length;
    const mediumIssues = issues.filter(i => i.severity === 'MEDIUM').length;
    const lowIssues = issues.filter(i => i.severity === 'LOW').length;

    const pendingIssues = issues.filter(i => i.status === 'PENDING').length;
    const inProgressIssues = issues.filter(i => i.status === 'IN_PROGRESS').length;
    const scheduledIssues = issues.filter(i => i.status === 'SCHEDULED').length;
    const completedCount = completedIssues.length;

    // Category breakdown
    const categoryBreakdown = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Fleet breakdown (top 10 most issues)
    const fleetBreakdown = issues.reduce((acc, issue) => {
      acc[issue.fleetNumber] = (acc[issue.fleetNumber] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topFleets = Object.entries(fleetBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([fleet, count]) => ({ fleet, count }));

    // Calculate average resolution time (for completed issues)
    let avgResolutionHours = 0;
    if (completedIssues.length > 0) {
      const totalHours = completedIssues.reduce((sum, issue) => {
        const created = new Date(issue.createdAt).getTime();
        const completed = new Date(issue.updatedAt).getTime();
        return sum + (completed - created) / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = totalHours / completedIssues.length;
    }

    // Daily breakdown for charts
    const dailyBreakdown: Array<{
      date: string;
      created: number;
      completed: number;
      critical: number;
    }> = [];

    const dayMs = 24 * 60 * 60 * 1000;
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / dayMs);
    
    for (let i = 0; i < Math.min(days, 31); i++) {
      const dayStart = new Date(startDate.getTime() + i * dayMs);
      const dayEnd = new Date(dayStart.getTime() + dayMs);
      
      const dayIssues = issues.filter(issue => {
        const created = new Date(issue.createdAt);
        return created >= dayStart && created < dayEnd;
      });

      const dayCompleted = completedIssues.filter(issue => {
        const completed = new Date(issue.updatedAt);
        return completed >= dayStart && completed < dayEnd;
      });

      dailyBreakdown.push({
        date: dayStart.toISOString().split('T')[0] || '',
        created: dayIssues.length,
        completed: dayCompleted.length,
        critical: dayIssues.filter(i => i.severity === 'CRITICAL').length
      });
    }

    // Build summary report
    const summary = {
      period: validated.period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      overview: {
        totalIssues,
        completedCount,
        resolutionRate: totalIssues > 0 ? Math.round((completedCount / totalIssues) * 100) : 0,
        avgResolutionHours: Math.round(avgResolutionHours * 10) / 10
      },
      bySeverity: {
        critical: criticalIssues,
        high: highIssues,
        medium: mediumIssues,
        low: lowIssues
      },
      byStatus: {
        pending: pendingIssues,
        inProgress: inProgressIssues,
        scheduled: scheduledIssues,
        completed: completedCount
      },
      byCategory: categoryBreakdown,
      topFleets,
      dailyBreakdown,
      highlights: {
        mostCommonCategory: Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A',
        fleetWithMostIssues: topFleets[0]?.fleet || 'N/A',
        criticalPercentage: totalIssues > 0 ? Math.round((criticalIssues / totalIssues) * 100) : 0
      },
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Summary report error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate summary report' },
      { status: 500 }
    );
  }
}

// POST endpoint to send summary email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period = 'weekly', recipients = [] } = body;

    // Generate the summary
    const summaryResponse = await GET(new NextRequest(
      new URL(`/api/reports/summary?period=${period}`, request.url)
    ));
    const summary = await summaryResponse.json();

    // Build email content
    const emailSubject = `SE Repairs ${period.charAt(0).toUpperCase() + period.slice(1)} Summary Report`;
    const emailBody = buildEmailContent(summary, period);

    // Send email via notification API
    const emailResponse = await fetch(new URL('/api/notifications/email', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients: recipients.length > 0 ? recipients : ['management@senational.com.au'],
        subject: emailSubject,
        message: emailBody,
        priority: 'MEDIUM'
      })
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send email');
    }

    return NextResponse.json({
      success: true,
      message: `${period} summary report sent successfully`,
      summary,
      sentTo: recipients.length > 0 ? recipients : ['management@senational.com.au']
    });

  } catch (error) {
    console.error('Send summary error:', error);
    return NextResponse.json(
      { error: 'Failed to send summary report' },
      { status: 500 }
    );
  }
}

function buildEmailContent(summary: SummaryReport, period: string): string {
  const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);
  
  return `
SE REPAIRS ${periodLabel.toUpperCase()} SUMMARY REPORT
Generated: ${new Date(summary.generatedAt).toLocaleString()}
Period: ${new Date(summary.dateRange.start).toLocaleDateString()} - ${new Date(summary.dateRange.end).toLocaleDateString()}

═══════════════════════════════════════════════════════

📊 OVERVIEW
• Total Issues Reported: ${summary.overview.totalIssues}
• Issues Completed: ${summary.overview.completedCount}
• Resolution Rate: ${summary.overview.resolutionRate}%
• Avg Resolution Time: ${summary.overview.avgResolutionHours} hours

═══════════════════════════════════════════════════════

🚨 BY SEVERITY
• Critical: ${summary.bySeverity.critical}
• High: ${summary.bySeverity.high}
• Medium: ${summary.bySeverity.medium}
• Low: ${summary.bySeverity.low}

═══════════════════════════════════════════════════════

📋 BY STATUS
• Pending: ${summary.byStatus.pending}
• In Progress: ${summary.byStatus.inProgress}
• Scheduled: ${summary.byStatus.scheduled}
• Completed: ${summary.byStatus.completed}

═══════════════════════════════════════════════════════

🔧 TOP CATEGORIES
${Object.entries(summary.byCategory)
  .sort(([, a], [, b]) => (b as number) - (a as number))
  .slice(0, 5)
  .map(([cat, count]) => `• ${cat}: ${count}`)
  .join('\n')}

═══════════════════════════════════════════════════════

🚛 TOP FLEETS (Most Issues)
${summary.topFleets.slice(0, 5).map((f: { fleet: string; count: number }) => `• ${f.fleet}: ${f.count} issues`).join('\n')}

═══════════════════════════════════════════════════════

💡 HIGHLIGHTS
• Most Common Issue: ${summary.highlights.mostCommonCategory}
• Fleet Needing Attention: ${summary.highlights.fleetWithMostIssues}
• Critical Issue Rate: ${summary.highlights.criticalPercentage}%

═══════════════════════════════════════════════════════

This is an automated report from SE Repairs Fleet Management System.
For detailed analytics, please log in to the admin dashboard.
  `.trim();
}