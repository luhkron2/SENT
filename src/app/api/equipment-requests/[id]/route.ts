import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/../auth';
import { logger } from '@/lib/logger';

// GET /api/equipment-requests/[id] - Get single equipment request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const equipmentRequest = await prisma.equipmentRequest.findUnique({
      where: { id: params.id },
      include: {
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        issue: {
          select: {
            id: true,
            ticket: true,
            fleetNumber: true,
            description: true,
            status: true,
          },
        },
      },
    });

    if (!equipmentRequest) {
      return NextResponse.json(
        { error: 'Equipment request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ request: equipmentRequest });
  } catch (error) {
    logger.error('Error fetching equipment request', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Failed to fetch equipment request' },
      { status: 500 }
    );
  }
}

// PATCH /api/equipment-requests/[id] - Update equipment request
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      status,
      priority,
      approvedBy,
      notes,
      estimatedCost,
      supplier,
      partNumber,
      cancellationReason,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
      
      // Set timestamps based on status
      if (status === 'APPROVED' && !updateData.approvedAt) {
        updateData.approvedAt = new Date();
        if (approvedBy) {
          updateData.approvedBy = approvedBy;
        }
      } else if (status === 'ORDERED') {
        updateData.orderedAt = new Date();
      } else if (status === 'RECEIVED') {
        updateData.receivedAt = new Date();
      } else if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
        if (cancellationReason) {
          updateData.cancellationReason = cancellationReason;
        }
      }
    }

    if (priority) updateData.priority = priority;
    if (notes !== undefined) updateData.notes = notes;
    if (estimatedCost !== undefined) {
      updateData.estimatedCost = estimatedCost ? parseFloat(estimatedCost) : null;
    }
    if (supplier !== undefined) updateData.supplier = supplier;
    if (partNumber !== undefined) updateData.partNumber = partNumber;

    const updated = await prisma.equipmentRequest.update({
      where: { id: params.id },
      data: updateData,
      include: {
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        issue: {
          select: {
            id: true,
            ticket: true,
            fleetNumber: true,
          },
        },
      },
    });

    return NextResponse.json({ request: updated });
  } catch (error) {
    logger.error('Error updating equipment request', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Failed to update equipment request' },
      { status: 500 }
    );
  }
}

// DELETE /api/equipment-requests/[id] - Delete equipment request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission (admin or the requester)
    const equipmentRequest = await prisma.equipmentRequest.findUnique({
      where: { id: params.id },
      select: { requestedById: true },
    });

    if (!equipmentRequest) {
      return NextResponse.json(
        { error: 'Equipment request not found' },
        { status: 404 }
      );
    }

    await prisma.equipmentRequest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting equipment request', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Failed to delete equipment request' },
      { status: 500 }
    );
  }
}
