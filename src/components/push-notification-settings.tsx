'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribedToPush,
  testPushNotification,
} from '@/lib/push-notifications';

export function PushNotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true);
      const supported = isPushSupported();
      setIsSupported(supported);

      if (supported) {
        const perm = getNotificationPermission();
        setPermission(perm);
        
        if (perm === 'granted') {
          const subscribed = await isSubscribedToPush();
          setIsSubscribed(subscribed);
        }
      }
      setLoading(false);
    };

    checkStatus();
  }, []);

  const handleEnableNotifications = async () => {
    setActionLoading(true);
    try {
      // Request permission
      const perm = await requestNotificationPermission();
      setPermission(perm);

      if (perm === 'granted') {
        // Subscribe to push
        const subscription = await subscribeToPushNotifications();
        
        if (subscription) {
          setIsSubscribed(true);
          toast.success('Push notifications enabled!', {
            description: 'You\'ll receive updates when your issues are processed.',
          });
        } else {
          toast.error('Failed to subscribe to push notifications');
        }
      } else {
        toast.error('Notification permission denied', {
          description: 'Please enable notifications in your browser settings.',
        });
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      toast.error('Failed to enable push notifications');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setActionLoading(true);
    try {
      const success = await unsubscribeFromPushNotifications();
      
      if (success) {
        setIsSubscribed(false);
        toast.success('Push notifications disabled');
      } else {
        toast.error('Failed to disable push notifications');
      }
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      toast.error('Failed to disable push notifications');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await testPushNotification();
      toast.success('Test notification sent!');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast.error('Failed to send test notification');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
              <BellOff className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle>Push Notifications Unavailable</CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                Your browser doesn't support push notifications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Try using a modern browser like Chrome, Firefox, or Safari to enable real-time updates.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                isSubscribed
                  ? 'bg-emerald-100 dark:bg-emerald-900'
                  : 'bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {isSubscribed ? (
                <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <BellOff className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              )}
            </div>
            <div>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Get real-time updates about your repair issues
              </CardDescription>
            </div>
          </div>
          {permission === 'granted' && isSubscribed && (
            <Badge variant="outline" className="gap-1 border-emerald-500 text-emerald-600">
              <CheckCircle className="h-3 w-3" />
              Active
            </Badge>
          )}
          {permission === 'denied' && (
            <Badge variant="outline" className="gap-1 border-red-500 text-red-600">
              <XCircle className="h-3 w-3" />
              Blocked
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <h4 className="mb-2 text-sm font-semibold">Get notified when:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Your issue is acknowledged by operations
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              A mechanic is assigned to your repair
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Your repair is scheduled
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Your vehicle is ready for collection
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {!isSubscribed ? (
            <Button
              onClick={handleEnableNotifications}
              disabled={actionLoading || permission === 'denied'}
              className="flex-1 gap-2"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              Enable Notifications
            </Button>
          ) : (
            <>
              <Button
                onClick={handleTestNotification}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Bell className="h-4 w-4" />
                Test Notification
              </Button>
              <Button
                onClick={handleDisableNotifications}
                disabled={actionLoading}
                variant="destructive"
                className="flex-1 gap-2"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
                Disable
              </Button>
            </>
          )}
        </div>

        {permission === 'denied' && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            <p className="font-medium">Permission Blocked</p>
            <p className="mt-1 text-xs">
              You've blocked notifications. To enable them, click the lock icon in your
              browser's address bar and allow notifications for this site.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
