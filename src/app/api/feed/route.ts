import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const { limit } = querySchema.parse({
      limit: searchParams.get('limit'),
    });

    // Fetch recent comments from workshop/operations staff
    const comments = await prisma.comment.findMany({
      where: {
        author: {
          role: {
            in: ['WORKSHOP', 'OPERATIONS', 'ADMIN'],
          },
        },
      },
      include: {
        author: {
          select: {
            name: true,
            role: true,
          },
        },
        issue: {
          select: {
            ticket: true,
            fleetNumber: true,
            status: true,
            severity: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit * 2, // Get more than needed to have variety
    });

    // Fetch recent work orders (assignments/scheduling)
    const workOrders = await prisma.workOrder.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: {
        assignedTo: {
          select: {
            name: true,
            role: true,
          },
        },
        issue: {
          select: {
            ticket: true,
            fleetNumber: true,
            status: true,
            severity: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Transform comments into feed items
    const commentItems = comments.map((comment) => ({
      id: `comment-${comment.id}`,
      type: 'comment' as const,
      ticket: comment.issue.ticket,
      fleetNumber: comment.issue.fleetNumber,
      message: comment.body,
      author: comment.author?.name || 'Staff',
      authorRole: comment.author?.role,
      timestamp: comment.createdAt.toISOString(),
      severity: comment.issue.severity,
      status: comment.issue.status,
    }));

    // Transform work orders into feed items
    const workOrderItems = workOrders.map((wo) => ({
      id: `workorder-${wo.id}`,
      type: wo.assignedTo ? ('assignment' as const) : ('schedule' as const),
      ticket: wo.issue.ticket,
      fleetNumber: wo.issue.fleetNumber,
      message: wo.assignedTo
        ? `${wo.assignedTo.name} has been assigned to handle this repair`
        : `Scheduled for ${new Date(wo.startAt).toLocaleDateString('en-AU', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}`,
      author: wo.assignedTo?.name,
      authorRole: wo.assignedTo?.role,
      timestamp: wo.createdAt.toISOString(),
      severity: wo.issue.severity,
      status: wo.status,
    }));

    // Combine and sort all items
    const allItems = [...commentItems, ...workOrderItems]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json({
      items: allItems,
      count: allItems.length,
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}
