import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '../../../../../auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const accessLevel = request.cookies.get('accessLevel')?.value;
    
    // Check if user is admin (either through NextAuth or access cookie)
    const isAdmin = (session?.user?.role === 'ADMIN') || (accessLevel === 'admin');
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all issues with counts by status and severity
    const [
      totalIssues,
      pendingIssues,
      inProgressIssues,
      completedIssues,
      criticalIssues,
      totalWorkOrders,
      scheduledWorkOrders,
      recentIssues,
      issuesByCategory,
      issuesBySeverity,
      workOrdersByStatus,
      totalFleetUnits,
      totalDrivers
    ] = await Promise.all([
      // Total issues
      prisma.issue.count(),
      
      // Issues by status
      prisma.issue.count({ where: { status: 'PENDING' } }),
      prisma.issue.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.issue.count({ where: { status: 'COMPLETED' } }),
      
      // Critical issues
      prisma.issue.count({ where: { severity: 'CRITICAL' } }),
      
      // Work orders
      prisma.workOrder.count(),
      prisma.workOrder.count({ where: { status: 'SCHEDULED' } }),
      
      // Recent issues (last 10)
      prisma.issue.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          ticket: true,
          severity: true,
          category: true,
          fleetNumber: true,
          driverName: true,
          createdAt: true,
          status: true,
        },
      }),
      
      // Issues by category
      prisma.issue.groupBy({
        by: ['category'],
        _count: { category: true },
      }),
      
      // Issues by severity
      prisma.issue.groupBy({
        by: ['severity'],
        _count: { severity: true },
      }),
      
      // Work orders by status
      prisma.workOrder.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      
      // Fleet and driver counts
      prisma.mapping.count({ where: { kind: 'fleet' } }),
      prisma.mapping.count({ where: { kind: 'driver' } }),
    ]);

    // Transform grouped data into objects
    const issuesByCategoryObj = issuesByCategory.reduce((acc, item) => {
      acc[item.category] = item._count.category;
      return acc;
    }, {} as Record<string, number>);

    const issuesBySeverityObj = issuesBySeverity.reduce((acc, item) => {
      acc[item.severity] = item._count.severity;
      return acc;
    }, {} as Record<string, number>);

    const workOrdersByStatusObj = workOrdersByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    const dashboardData = {
      totalIssues,
      pendingIssues,
      inProgressIssues,
      completedIssues,
      criticalIssues,
      totalWorkOrders,
      scheduledWorkOrders,
      totalFleetUnits,
      totalDrivers,
      recentIssues,
      issuesByCategory: issuesByCategoryObj,
      issuesBySeverity: issuesBySeverityObj,
      workOrdersByStatus: workOrdersByStatusObj,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}