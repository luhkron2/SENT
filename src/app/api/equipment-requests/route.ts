import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/../auth';
import { logger } from '@/lib/logger';

// GET /api/equipment-requests - Get all equipment requests (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const issueId = searchParams.get('issueId');

    const where: Record<string, unknown> = {};
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (issueId) {
      where.issueId = issueId;
    }

    const requests = await prisma.equipmentRequest.findMany({
      where,
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
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ requests });
  } catch (error) {
    logger.error('Error fetching equipment requests', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Failed to fetch equipment requests' },
      { status: 500 }
    );
  }
}

// POST /api/equipment-requests - Create new equipment request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      issueId,
      itemName,
      itemDescription,
      quantity = 1,
      estimatedCost,
      supplier,
      partNumber,
      reason,
      fleetNumber,
      priority = 'MEDIUM',
      urgentReason,
    } = body;

    // Validation
    if (!itemName || !reason) {
      return NextResponse.json(
        { error: 'Item name and reason are required' },
        { status: 400 }
      );
    }

    if (priority === 'URGENT' && !urgentReason) {
      return NextResponse.json(
        { error: 'Urgent reason is required for URGENT priority' },
        { status: 400 }
      );
    }

    // Create equipment request
    const equipmentRequest = await prisma.equipmentRequest.create({
      data: {
        issueId: issueId || null,
        requestedById: session.user.id as string,
        itemName,
        itemDescription,
        quantity,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
        supplier,
        partNumber,
        reason,
        fleetNumber,
        priority,
        urgentReason,
        status: 'PENDING',
      },
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

    return NextResponse.json({ request: equipmentRequest }, { status: 201 });
  } catch (error) {
    logger.error('Error creating equipment request', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Failed to create equipment request' },
      { status: 500 }
    );
  }
}
