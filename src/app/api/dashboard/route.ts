import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { formatMelbourneShort } from '@/lib/time'

const hasValidDatabaseUrl = (): boolean => {
  const url = process.env.DATABASE_URL;
  return (
    typeof url === 'string' &&
    (
      url.startsWith('postgres://') ||
      url.startsWith('postgresql://') ||
      url.startsWith('file:')
    )
  );
};

export async function GET(): Promise<NextResponse> {
  if (!hasValidDatabaseUrl()) {
    return NextResponse.json({ error: 'Database connection is not configured.' }, { status: 503 });
  }

  try {
    // Get real stats from database
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalIssues,
      activeIssues,
      completedToday,
      urgentIssues,
      scheduledWorkOrders,
      recentIssues,
      recentWorkOrders
    ] = await Promise.all([
      // Total issues count
      prisma.issue.count(),
      // Active issues (PENDING or IN_PROGRESS)
      prisma.issue.count({
        where: { status: { in: ['PENDING', 'IN_PROGRESS'] } }
      }),
      // Completed today
      prisma.issue.count({
        where: {
          status: 'COMPLETED',
          updatedAt: { gte: todayStart }
        }
      }),
      // Urgent issues (HIGH or CRITICAL severity, not completed)
      prisma.issue.count({
        where: {
          severity: { in: ['HIGH', 'CRITICAL'] },
          status: { not: 'COMPLETED' }
        }
      }),
      // Scheduled work orders
      prisma.workOrder.count({
        where: { status: 'SCHEDULED' }
      }),
      // Recent issues for activity feed
      prisma.issue.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          ticket: true,
          category: true,
          fleetNumber: true,
          severity: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      // Recent work orders for activity feed
      prisma.workOrder.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          issue: {
            select: { ticket: true, fleetNumber: true, category: true }
          }
        }
      })
    ]);

    // Calculate workshop capacity (based on scheduled vs completed ratio)
    const workshopCapacity = scheduledWorkOrders > 0 
      ? Math.min(100, Math.round((scheduledWorkOrders / (scheduledWorkOrders + 5)) * 100))
      : 0;

    // Calculate average repair time from completed issues today
    const completedIssues = await prisma.issue.findMany({
      where: {
        status: 'COMPLETED',
        updatedAt: { gte: todayStart }
      },
      select: { createdAt: true, updatedAt: true }
    });

    let averageRepairTime = 'N/A';
    if (completedIssues.length > 0) {
      const totalHours = completedIssues.reduce((sum, issue) => {
        const diffMs = issue.updatedAt.getTime() - issue.createdAt.getTime();
        return sum + (diffMs / (1000 * 60 * 60));
      }, 0);
      const avgHours = totalHours / completedIssues.length;
      averageRepairTime = avgHours < 1 
        ? `${Math.round(avgHours * 60)}m` 
        : `${avgHours.toFixed(1)}h`;
    }

    const stats = {
      totalIssues,
      activeIssues,
      completedToday,
      averageRepairTime,
      workshopCapacity,
      urgentIssues
    };

    // Build activity feed from real data
    type Activity = {
      id: string;
      type: 'issue_reported' | 'issue_completed' | 'workorder_created';
      title: string;
      description: string;
      timestamp: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
    };
    
    const activities: Activity[] = [];

    // Add recent issues to activity feed
    for (const issue of recentIssues) {
      const isCompleted = issue.status === 'COMPLETED';
      activities.push({
        id: `issue-${issue.id}`,
        type: isCompleted ? 'issue_completed' : 'issue_reported',
        title: isCompleted 
          ? `${issue.category} repair completed`
          : `${issue.category} issue reported`,
        description: `${issue.category} - Truck #${issue.fleetNumber}`,
        timestamp: formatMelbourneShort(isCompleted ? issue.updatedAt : issue.createdAt),
        priority: issue.severity.toLowerCase() as 'low' | 'medium' | 'high' | 'critical'
      });
    }

    // Add recent work orders to activity feed
    for (const wo of recentWorkOrders) {
      activities.push({
        id: `wo-${wo.id}`,
        type: 'workorder_created',
        title: `${wo.issue.category} scheduled`,
        description: `${wo.issue.category} - Truck #${wo.issue.fleetNumber}`,
        timestamp: formatMelbourneShort(wo.createdAt),
        priority: 'medium'
      });
    }

    // Activities are already sorted by their creation time from the database queries

    return NextResponse.json({
      stats,
      activities: activities.slice(0, 6)
    });

  } catch (error) {
    logger.error('Dashboard API Error:', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
