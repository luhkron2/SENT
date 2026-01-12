'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Truck, Calendar, Wrench, AlertTriangle } from 'lucide-react';
import { ServiceHistoryTimeline } from '@/components/service-history-timeline';
import { PhotoGallery } from '@/components/photo-gallery';
import { useAuth } from '@/hooks/useAuth';
import { LoadingPage } from '@/components/ui/loading';
import Link from 'next/link';

interface IssueWithMedia {
  id: string;
  ticket: number;
  status: string;
  severity: string;
  category: string;
  description: string;
  createdAt: string;
  media: Array<{
    id: string;
    url: string;
    type: string;
    createdAt: string;
  }>;
}

export default function FleetHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const fleetNumber = params.fleetNumber as string;
  const { isAuthenticated, loading: authLoading } = useAuth();

  interface MediaItem {
    id: string;
    url: string;
    type: string;
    createdAt: string;
    ticket?: number;
    issueId?: string;
  }

  const [issues, setIssues] = useState<IssueWithMedia[]>([]);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAuthenticated && fleetNumber) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/fleet/${encodeURIComponent(fleetNumber)}/history`);
          if (response.ok) {
            const data = await response.json();
            setIssues(data.issues || []);
            
            // Collect all media from all issues
            const media: MediaItem[] = [];
            for (const issue of data.issues || []) {
              if (issue.media) {
                for (const m of issue.media) {
                  media.push({
                    id: m.id,
                    url: m.url,
                    type: m.type,
                    createdAt: m.createdAt,
                    ticket: issue.ticket,
                    issueId: issue.id
                  });
                }
              }
            }
            setAllMedia(media);
          }
        } catch (error) {
          console.error('Failed to fetch fleet data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [authLoading, isAuthenticated, fleetNumber]);

  if (authLoading || loading) {
    return <LoadingPage text={`Loading history for ${fleetNumber}...`} />;
  }

  if (!isAuthenticated) {
    router.push('/access');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-sm dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div className="leading-tight">
                <span className="block text-xs font-semibold uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
                  Service History
                </span>
                <span className="block text-lg font-bold text-slate-900 dark:text-white">
                  {fleetNumber}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {issues.length} issues
            </Badge>
            <Link href="/fleet">
              <Button variant="outline" size="sm">
                Back to Fleet
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Timeline - Main Column */}
          <div className="lg:col-span-2">
            <ServiceHistoryTimeline 
              fleetNumber={fleetNumber} 
              maxEvents={50}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Photo Gallery */}
            {allMedia.length > 0 && (
              <PhotoGallery 
                media={allMedia}
                title={`All Photos (${allMedia.length})`}
              />
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Issues</span>
                  <Badge variant="outline">{issues.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <Badge className="bg-green-500">
                    {issues.filter(i => i.status === 'COMPLETED').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <Badge className="bg-blue-500">
                    {issues.filter(i => i.status !== 'COMPLETED').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Critical</span>
                  <Badge variant="destructive">
                    {issues.filter(i => i.severity === 'CRITICAL').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Photos</span>
                  <Badge variant="secondary">{allMedia.length}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Recent Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {issues.slice(0, 5).map((issue) => (
                  <Link 
                    key={issue.id} 
                    href={`/issues/${issue.id}`}
                    className="block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">#{issue.ticket}</span>
                        <span className="text-xs text-muted-foreground ml-2">{issue.category}</span>
                      </div>
                      <Badge 
                        variant={issue.severity === 'CRITICAL' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {issue.severity}
                      </Badge>
                    </div>
                  </Link>
                ))}
                {issues.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No issues recorded
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}