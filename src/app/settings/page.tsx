'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, RefreshCw, Database, Bell, Globe } from 'lucide-react';

interface SystemSettings {
  siteName: string;
  maintenanceMode: boolean;
  allowGuestReports: boolean;
  autoArchiveDays: number;
  notificationsEnabled: boolean;
  emailAlerts: boolean;
  syncInterval: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'SE Repairs',
    maintenanceMode: false,
    allowGuestReports: true,
    autoArchiveDays: 90,
    notificationsEnabled: true,
    emailAlerts: true,
    syncInterval: 15,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testGearboxConnection = async () => {
    try {
      const response = await fetch('/api/gearbox/vehicles');
      if (response.ok) {
        toast.success('Gearbox connection successful');
      } else {
        toast.error('Gearbox connection failed');
      }
    } catch {
      toast.error('Failed to test Gearbox connection');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage your system configuration
            </p>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">
              <Globe className="mr-2 h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Database className="mr-2 h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">
                      Disable site for all users except admins
                    </p>
                  </div>
                  <Checkbox
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked: boolean) => setSettings({ ...settings, maintenanceMode: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowGuestReports">Allow Guest Reports</Label>
                    <p className="text-sm text-gray-500">
                      Allow unauthenticated users to report issues
                    </p>
                  </div>
                  <Checkbox
                    id="allowGuestReports"
                    checked={settings.allowGuestReports}
                    onCheckedChange={(checked: boolean) => setSettings({ ...settings, allowGuestReports: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="autoArchiveDays">Auto-Archive Issues (Days)</Label>
                  <Input
                    id="autoArchiveDays"
                    type="number"
                    min="7"
                    max="365"
                    value={settings.autoArchiveDays}
                    onChange={(e) => setSettings({ ...settings, autoArchiveDays: parseInt(e.target.value) })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificationsEnabled">Enable Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Enable push notifications for new issues
                    </p>
                  </div>
                  <Checkbox
                    id="notificationsEnabled"
                    checked={settings.notificationsEnabled}
                    onCheckedChange={(checked: boolean) => setSettings({ ...settings, notificationsEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailAlerts">Email Alerts</Label>
                    <p className="text-sm text-gray-500">
                      Send email notifications for critical issues
                    </p>
                  </div>
                  <Checkbox
                    id="emailAlerts"
                    checked={settings.emailAlerts}
                    onCheckedChange={(checked: boolean) => setSettings({ ...settings, emailAlerts: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
                  <Input
                    id="syncInterval"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.syncInterval}
                    onChange={(e) => setSettings({ ...settings, syncInterval: parseInt(e.target.value) })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gearbox Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input
                    type="password"
                    value="••••••••••••"
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <Input
                    type="password"
                    value="••••••••••••"
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={testGearboxConnection}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Test Connection
                </Button>

                <p className="text-sm text-gray-500">
                  Contact Gearbox Support to obtain API credentials. Update credentials in environment variables.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
