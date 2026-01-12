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

    // Fetch all data
    const [issues, workOrders, users, mappings] = await Promise.all([
      prisma.issue.findMany({
        include: {
          comments: true,
          media: true,
          workOrders: true,
        },
      }),
      prisma.workOrder.findMany({
        include: {
          issue: true,
          assignedTo: true,
        },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
          // Exclude password field
        },
      }),
      prisma.mapping.findMany(),
    ]);

    // Create comprehensive export data
    const exportData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalIssues: issues.length,
        totalWorkOrders: workOrders.length,
        totalUsers: users.length,
        totalMappings: mappings.length,
      },
      issues,
      workOrders,
      users,
      mappings,
    };

    // Convert to JSON string
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // Create response with proper headers for file download
    const response = new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="se-repairs-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });

    return response;
  } catch (error) {
    console.error('Export all data error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}