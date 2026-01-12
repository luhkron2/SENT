import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '../../../../auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const accessLevel = request.cookies.get('accessLevel')?.value;
    
    // Check if user has access (operations, workshop, or admin)
    const hasAccess = (session?.user?.role && ['OPERATIONS', 'WORKSHOP', 'ADMIN'].includes(session.user.role)) || 
                     (accessLevel && ['operations', 'workshop', 'admin'].includes(accessLevel));
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get performance metrics
    const [
      totalIssues,
      resolvedIssues,
      criticalIssues,
      _avgResolutionTime,
      issuesLast7Days,
      issuesLast30Days,
      topCategories,
      fleetWithMostIssues,
      responseTimeMetrics
    ] = await Promise.all([
      // Total issues
      prisma.issue.count(),
      
      // Resolved issues
      prisma.issue.count({ 
        where: { status: { in: ['COMPLETED'] } } 
      }),
      
      // Critical issues
      prisma.issue.count({ 
        where: { severity: 'CRITICAL' } 
      }),
      
      // Average resolution time (for completed issues)
      prisma.issue.aggregate({
        where: { 
          status: { in: ['COMPLETED'] },
          updatedAt: { gte: thirtyDaysAgo }
        },
        _avg: {
          // This is a simplified calculation - in reality you'd track actual resolution time
          ticket: true
        }
      }),
      
      // Issues in last 7 days
      prisma.issue.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),
      
      // Issues in last 30 days
      prisma.issue.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      
      // Top issue categories
      prisma.issue.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
        take: 5
      }),
      
      // Fleet units with most issues
      prisma.issue.groupBy({
        by: ['fleetNumber'],
        _count: { fleetNumber: true },
        orderBy: { _count: { fleetNumber: 'desc' } },
        take: 5
      }),
      
      // Response time metrics (time from creation to first update)
      prisma.$queryRaw`
        SELECT 
          AVG(CAST((julianday(updatedAt) - julianday(createdAt)) * 24 AS REAL)) as avgHours,
          COUNT(*) as count
        FROM Issue 
        WHERE createdAt >= ${thirtyDaysAgo.toISOString()}
        AND updatedAt > createdAt
      `
    ]);

    // Calculate metrics
    const resolutionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;
    const criticalRate = totalIssues > 0 ? (criticalIssues / totalIssues) * 100 : 0;
    const weeklyTrend = issuesLast7Days;
    const monthlyTrend = issuesLast30Days;

    // Format response time data
    const responseTime = Array.isArray(responseTimeMetrics) && responseTimeMetrics.length > 0 
      ? responseTimeMetrics[0] as { avgHours: number; count: number }
      : { avgHours: 0, count: 0 };

    const metrics = {
      overview: {
        totalIssues,
        resolvedIssues,
        criticalIssues,
        resolutionRate: Math.round(resolutionRate * 10) / 10,
        criticalRate: Math.round(criticalRate * 10) / 10,
      },
      trends: {
        issuesLast7Days,
        issuesLast30Days,
        weeklyTrend,
        monthlyTrend,
      },
      performance: {
        avgResolutionTimeHours: responseTime.avgHours ? Math.round(responseTime.avgHours * 10) / 10 : 0,
        responseTimeCount: responseTime.count,
        firstTimeFixRate: 85, // Placeholder - would need more complex calculation
        fleetAvailability: 92, // Placeholder - would need fleet status tracking
      },
      insights: {
        topCategories: topCategories.map(cat => ({
          category: cat.category,
          count: cat._count.category
        })),
        problematicFleets: fleetWithMostIssues.map(fleet => ({
          fleetNumber: fleet.fleetNumber,
          issueCount: fleet._count.fleetNumber
        })),
      }
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}