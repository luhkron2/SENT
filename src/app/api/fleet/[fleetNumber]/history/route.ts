import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { fleetNumber: string } }
) {
  try {
    const fleetNumber = params.fleetNumber;
    
    // Get all issues for this fleet number with related data
    const issues = await prisma.issue.findMany({
      where: { fleetNumber },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' }
        },
        workOrders: {
          include: {
            assignedTo: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        media: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Build timeline events from issues, comments, and work orders
    const timelineEvents: Array<{
      id: string;
      type: 'issue_created' | 'status_change' | 'comment' | 'work_order' | 'completed';
      date: Date;
      title: string;
      description: string;
      severity?: string;
      status?: string;
      category?: string;
      issueId?: string;
      ticket?: number;
      author?: string;
      metadata?: Record<string, unknown>;
    }> = [];

    for (const issue of issues) {
      // Issue created event
      timelineEvents.push({
        id: `issue-${issue.id}`,
        type: 'issue_created',
        date: issue.createdAt,
        title: `Issue Reported: ${issue.category}`,
        description: issue.description,
        severity: issue.severity,
        status: issue.status,
        category: issue.category,
        issueId: issue.id,
        ticket: issue.ticket,
        metadata: {
          driverName: issue.driverName,
          location: issue.location
        }
      });

      // Work order events
      for (const wo of issue.workOrders) {
        timelineEvents.push({
          id: `wo-${wo.id}`,
          type: 'work_order',
          date: wo.createdAt,
          title: `Work Order: ${wo.workType || 'Repair'}`,
          description: wo.notes || 'Scheduled for repair',
          status: wo.status,
          issueId: issue.id,
          ticket: issue.ticket,
          author: wo.assignedTo?.name || undefined,
          metadata: {
            workshopSite: wo.workshopSite,
            startAt: wo.startAt,
            endAt: wo.endAt
          }
        });
      }

      // Comment events
      for (const comment of issue.comments) {
        timelineEvents.push({
          id: `comment-${comment.id}`,
          type: 'comment',
          date: comment.createdAt,
          title: 'Update Added',
          description: comment.body,
          issueId: issue.id,
          ticket: issue.ticket
        });
      }

      // Completed event if issue is completed
      if (issue.status === 'COMPLETED') {
        timelineEvents.push({
          id: `completed-${issue.id}`,
          type: 'completed',
          date: issue.updatedAt,
          title: 'Repair Completed',
          description: `${issue.category} issue resolved`,
          category: issue.category,
          issueId: issue.id,
          ticket: issue.ticket
        });
      }
    }

    // Sort by date descending
    timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate summary stats
    const stats = {
      totalIssues: issues.length,
      completedRepairs: issues.filter(i => i.status === 'COMPLETED').length,
      pendingIssues: issues.filter(i => i.status === 'PENDING').length,
      inProgressIssues: issues.filter(i => i.status === 'IN_PROGRESS').length,
      criticalIssues: issues.filter(i => i.severity === 'CRITICAL').length,
      categories: [...new Set(issues.map(i => i.category))],
      firstIssueDate: issues.length > 0 ? issues[issues.length - 1]?.createdAt ?? null : null,
      lastIssueDate: issues.length > 0 ? issues[0]?.createdAt ?? null : null
    };

    return NextResponse.json({
      fleetNumber,
      timeline: timelineEvents,
      stats,
      issues: issues.map(i => ({
        id: i.id,
        ticket: i.ticket,
        status: i.status,
        severity: i.severity,
        category: i.category,
        description: i.description,
        createdAt: i.createdAt,
        mediaCount: i.media.length
      }))
    });

  } catch (error) {
    console.error('Service history error:', error);
    return NextResponse.json(
      { error: 'Failed to get service history' },
      { status: 500 }
    );
  }
}