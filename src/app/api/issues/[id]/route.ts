import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/../auth';
import { logger } from '@/lib/logger';
import type { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        media: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        workOrders: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error) {
    logger.error('Error fetching issue:', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, severity, ...otherFields } = body as Record<string, unknown>;
    
    const updateData: Prisma.IssueUpdateInput = { ...otherFields };
    if (status) updateData.status = status as Prisma.IssueUpdateInput['status'];
    if (severity) updateData.severity = severity as Prisma.IssueUpdateInput['severity'];

    const issue = await prisma.issue.update({
      where: { id },
      data: updateData,
      include: {
        media: true,
        comments: true,
        workOrders: true,
      },
    });

    return NextResponse.json(issue);
  } catch (error) {
    logger.error('Error updating issue:', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    );
  }
}

