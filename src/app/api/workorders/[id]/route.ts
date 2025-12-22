import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/../auth';
import { logger } from '@/lib/logger';
import type { Prisma } from '@prisma/client';

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
    const { status, startAt, endAt, ...otherFields } = body as Record<string, unknown>;
    
    const updateData: Prisma.WorkOrderUpdateInput = { ...otherFields };
    
    if (status) {
      updateData.status = status as Prisma.WorkOrderUpdateInput['status'];
    }
    if (startAt && typeof startAt === 'string') {
      updateData.startAt = new Date(startAt);
    }
    if (endAt && typeof endAt === 'string') {
      updateData.endAt = new Date(endAt);
    }

    const workOrder = await prisma.workOrder.update({
      where: { id },
      data: updateData,
      include: {
        issue: true,
        assignedTo: true,
      },
    });

    // Sync issue status with work order status
    if (status) {
      await prisma.issue.update({
        where: { id: workOrder.issueId },
        data: { status: status as Prisma.IssueUpdateInput['status'] },
      });
    }

    return NextResponse.json(workOrder);
  } catch (error) {
    logger.error('Error updating work order:', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Failed to update work order' },
      { status: 500 }
    );
  }
}

