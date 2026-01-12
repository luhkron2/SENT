import { Issue, Severity, Status } from '@prisma/client';

export interface NotificationRule {
  id: string;
  name: string;
  trigger: 'issue_created' | 'issue_updated' | 'critical_issue' | 'repair_completed' | 'parts_needed';
  conditions: {
    severity?: Severity[];
    status?: Status[];
    category?: string[];
    fleetNumbers?: string[];
    timeThreshold?: number; // minutes
  };
  recipients: {
    roles: ('DRIVER' | 'OPERATIONS' | 'WORKSHOP' | 'ADMIN')[];
    emails?: string[];
    phones?: string[];
  };
  channels: ('email' | 'sms' | 'push' | 'dashboard')[];
  template: string;
  enabled: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  recipients: string[];
  channels: string[];
  priority: string;
  timestamp: Date;
}

export class NotificationService {
  private static readonly DEFAULT_RULES: NotificationRule[] = [
    {
      id: 'critical-issue-alert',
      name: 'Critical Issue Alert',
      trigger: 'issue_created',
      conditions: {
        severity: ['CRITICAL']
      },
      recipients: {
        roles: ['OPERATIONS', 'ADMIN'],
        emails: ['operations@senational.com.au', 'workshop@senational.com.au']
      },
      channels: ['email', 'sms', 'dashboard'],
      template: 'CRITICAL ALERT: {fleetNumber} - {category} issue reported by {driverName}. Location: {location}. Immediate attention required.',
      enabled: true,
      priority: 'CRITICAL'
    },
    {
      id: 'repair-completed',
      name: 'Repair Completed Notification',
      trigger: 'issue_updated',
      conditions: {
        status: ['COMPLETED']
      },
      recipients: {
        roles: ['DRIVER', 'OPERATIONS']
      },
      channels: ['sms', 'dashboard'],
      template: 'Good news! Your vehicle {fleetNumber} repair is complete and ready for pickup. Contact workshop for details.',
      enabled: true,
      priority: 'MEDIUM'
    },
    {
      id: 'parts-needed-alert',
      name: 'Parts Required Alert',
      trigger: 'parts_needed',
      conditions: {},
      recipients: {
        roles: ['OPERATIONS', 'ADMIN'],
        emails: ['parts@senational.com.au']
      },
      channels: ['email', 'dashboard'],
      template: 'Parts required for {fleetNumber} - {category} repair. Estimated cost: ${estimatedCost}. Lead time: {leadTime}.',
      enabled: true,
      priority: 'HIGH'
    },
    {
      id: 'high-priority-update',
      name: 'High Priority Issue Update',
      trigger: 'issue_updated',
      conditions: {
        severity: ['HIGH', 'CRITICAL']
      },
      recipients: {
        roles: ['OPERATIONS']
      },
      channels: ['dashboard', 'push'],
      template: 'Update on {fleetNumber}: Status changed to {status}. {updateMessage}',
      enabled: true,
      priority: 'HIGH'
    },
    {
      id: 'daily-summary',
      name: 'Daily Operations Summary',
      trigger: 'issue_created', // This would be time-based in production
      conditions: {},
      recipients: {
        roles: ['ADMIN'],
        emails: ['management@senational.com.au']
      },
      channels: ['email'],
      template: 'Daily Summary: {totalIssues} new issues, {criticalCount} critical, {completedCount} completed.',
      enabled: true,
      priority: 'LOW'
    }
  ];

  static async processNotification(
    trigger: NotificationRule['trigger'],
    data: Record<string, unknown>
  ): Promise<void> {
    const applicableRules = this.DEFAULT_RULES.filter(rule => 
      rule.enabled && rule.trigger === trigger
    );

    for (const rule of applicableRules) {
      if (this.matchesConditions(rule.conditions, data)) {
        const notification = this.buildNotification(rule, data);
        await this.sendNotification(notification);
      }
    }
  }

  private static matchesConditions(conditions: NotificationRule['conditions'], data: Record<string, unknown>): boolean {
    // Check severity condition
    if (conditions.severity && data.severity) {
      if (!conditions.severity.includes(data.severity as Severity)) {
        return false;
      }
    }

    // Check status condition
    if (conditions.status && data.status) {
      if (!conditions.status.includes(data.status as Status)) {
        return false;
      }
    }

    // Check category condition
    if (conditions.category && data.category) {
      if (!conditions.category.includes(data.category as string)) {
        return false;
      }
    }

    // Check fleet numbers condition
    if (conditions.fleetNumbers && data.fleetNumber) {
      if (!conditions.fleetNumbers.includes(data.fleetNumber as string)) {
        return false;
      }
    }

    // Check time threshold (for overdue issues)
    if (conditions.timeThreshold && data.createdAt) {
      const minutesOld = (Date.now() - new Date(data.createdAt as string).getTime()) / (1000 * 60);
      if (minutesOld < conditions.timeThreshold) {
        return false;
      }
    }

    return true;
  }

  private static buildNotification(rule: NotificationRule, data: Record<string, unknown>): NotificationPayload {
    // Replace template variables
    let message = rule.template;
    const replacements: Record<string, string> = {
      '{fleetNumber}': String(data.fleetNumber || 'Unknown'),
      '{category}': String(data.category || 'General'),
      '{driverName}': String(data.driverName || 'Driver'),
      '{location}': String(data.location || 'Unknown location'),
      '{status}': String(data.status || 'Unknown'),
      '{updateMessage}': String(data.updateMessage || ''),
      '{estimatedCost}': String(data.estimatedCost || '0'),
      '{leadTime}': String(data.leadTime || 'Unknown'),
      '{totalIssues}': String(data.totalIssues || '0'),
      '{criticalCount}': String(data.criticalCount || '0'),
      '{completedCount}': String(data.completedCount || '0')
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      message = message.replace(placeholder, value);
    }

    // Build recipient list
    const recipients: string[] = [];
    if (rule.recipients.emails) {
      recipients.push(...rule.recipients.emails);
    }
    if (rule.recipients.phones) {
      recipients.push(...rule.recipients.phones);
    }

    return {
      type: rule.trigger,
      title: rule.name,
      message,
      data,
      recipients,
      channels: rule.channels,
      priority: rule.priority,
      timestamp: new Date()
    };
  }

  private static async sendNotification(notification: NotificationPayload): Promise<void> {
    console.log('Sending notification:', notification);

    // Send via different channels
    for (const channel of notification.channels) {
      switch (channel) {
        case 'email':
          await this.sendEmail(notification);
          break;
        case 'sms':
          await this.sendSMS(notification);
          break;
        case 'push':
          await this.sendPushNotification(notification);
          break;
        case 'dashboard':
          await this.sendDashboardNotification(notification);
          break;
      }
    }
  }

  private static async sendEmail(notification: NotificationPayload): Promise<void> {
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log('📧 Email notification:', {
      to: notification.recipients,
      subject: notification.title,
      body: notification.message
    });

    // Mock email sending
    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: notification.recipients,
          subject: notification.title,
          message: notification.message,
          priority: notification.priority
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Email notification failed:', error);
    }
  }

  private static async sendSMS(notification: NotificationPayload): Promise<void> {
    // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log('📱 SMS notification:', {
      to: notification.recipients,
      message: notification.message
    });

    // Mock SMS sending
    try {
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: notification.recipients,
          message: notification.message,
          priority: notification.priority
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }
    } catch (error) {
      console.error('SMS notification failed:', error);
    }
  }

  private static async sendPushNotification(notification: NotificationPayload): Promise<void> {
    // In production, integrate with push service (Firebase, OneSignal, etc.)
    console.log('🔔 Push notification:', {
      title: notification.title,
      message: notification.message
    });

    // Mock push notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.type
        });
      }
    }
  }

  private static async sendDashboardNotification(notification: NotificationPayload): Promise<void> {
    // Send to real-time dashboard via Server-Sent Events
    console.log('📊 Dashboard notification:', notification);

    try {
      const response = await fetch('/api/notifications/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        throw new Error('Failed to send dashboard notification');
      }
    } catch (error) {
      console.error('Dashboard notification failed:', error);
    }
  }

  // Helper methods for common notification scenarios
  static async notifyNewIssue(issue: Issue & { driverName: string }): Promise<void> {
    await this.processNotification('issue_created', issue);
  }

  static async notifyIssueUpdate(issue: Issue & { updateMessage?: string }): Promise<void> {
    await this.processNotification('issue_updated', issue);
  }

  static async notifyPartsNeeded(data: {
    fleetNumber: string;
    category: string;
    estimatedCost: number;
    leadTime: string;
  }): Promise<void> {
    await this.processNotification('parts_needed', data);
  }

  static async notifyRepairCompleted(issue: Issue): Promise<void> {
    await this.processNotification('issue_updated', {
      ...issue,
      status: 'COMPLETED'
    });
  }
}