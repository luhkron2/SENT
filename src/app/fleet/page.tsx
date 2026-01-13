'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Search, 
  Truck, 
  Users, 
  Package,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  TrendingUp,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from '@/components/notification-bell';
import { LoadingPage } from '@/components/ui/loading';

interface FleetUnit {
  fleetNumber: string;
  rego: string;
  type: string;
  status: string;
  location: string;
  driver: string;
  phone: string;
  issueCount?: number;
  lastIssueDate?: string;
}

interface Trailer {
  fleetNumber: string;
  rego: string;
  type: string;
  status: string;
  location: string;
  issueCount?: number;
}

interface Driver {
  name: string;
  phone: string;
  employeeId: string;
  status: string;
  assignedFleet?: string;
  issueCount?: number;
}

interface EquipmentStats {
  totalFleet: number;
  activeFleet: number;
  inactiveFleet: number;
  totalTrailers: number;
  activeTrailers: number;
  totalDrivers: number;
  activeDrivers: number;
}

export default function FleetPage() {
  const { isAuthenticated, accessLevel, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [fleetUnits, setFleetUnits] = useState<FleetUnit[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stats, setStats] = useState<EquipmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFleet, setFilteredFleet] = useState<FleetUnit[]>([]);
  const [filteredTrailers, setFilteredTrailers] = useState<Trailer[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !['operations', 'workshop', 'admin'].includes(accessLevel || '')) {
        router.push('/access');
        return;
      }
      fetchEquipmentData();
    }
  }, [authLoading, isAuthenticated, accessLevel, router]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();

    setFilteredFleet(
      fleetUnits.filter(f => 
        f.fleetNumber.toLowerCase().includes(term) ||
        f.rego.toLowerCase().includes(term) ||
        f.driver.toLowerCase().includes(term) ||
        f.location.toLowerCase().includes(term)
      )
    );

    setFilteredTrailers(
      trailers.filter(t => 
        t.fleetNumber.toLowerCase().includes(term) ||
        t.rego.toLowerCase().includes(term) ||
        t.location.toLowerCase().includes(term)
      )
    );

    setFilteredDrivers(
      drivers.filter(d => 
        d.name.toLowerCase().includes(term) ||
        d.phone.toLowerCase().includes(term) ||
        d.employeeId.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, fleetUnits, trailers, drivers]);

  const fetchEquipmentData = async () => {
    try {
      setLoading(true);
      
      // Fetch mappings
      const mappingsResponse = await fetch('/api/mappings');
      if (!mappingsResponse.ok) {
        throw new Error('Failed to fetch mappings');
      }
      const mappingsData = await mappingsResponse.json();

      // Fetch issues to get counts
      const issuesResponse = await fetch('/api/issues');
      const issuesData = issuesResponse.ok ? await issuesResponse.json() : [];

      interface FleetMappingData {
        rego?: string;
        type?: string;
        status?: string;
        location?: string;
        driver?: string;
        phone?: string;
        employeeId?: string;
      }

      interface IssueData {
        fleetNumber: string;
        trailerA?: string;
        trailerB?: string;
        driverName?: string;
        createdAt: string;
      }

      // Process fleet units
      const fleetData: FleetUnit[] = Object.entries(mappingsData.fleets || {}).map(([fleetNumber, rawData]) => {
        const data = rawData as FleetMappingData;
        const fleetIssues = issuesData.filter((issue: IssueData) => issue.fleetNumber === fleetNumber);
        return {
          fleetNumber,
          rego: data.rego || 'N/A',
          type: data.type || 'Prime Mover',
          status: data.status || 'Active',
          location: data.location || 'Unknown',
          driver: data.driver || 'Unassigned',
          phone: data.phone || 'N/A',
          issueCount: fleetIssues.length,
          lastIssueDate: fleetIssues.length > 0 ? fleetIssues[0].createdAt : undefined,
        };
      });

      // Process trailers
      const trailerData: Trailer[] = Object.entries(mappingsData.trailers || {}).map(([fleetNumber, rawData]) => {
        const data = rawData as FleetMappingData;
        const trailerIssues = issuesData.filter((issue: IssueData) => 
          issue.trailerA === fleetNumber || issue.trailerB === fleetNumber
        );
        return {
          fleetNumber,
          rego: data.rego || 'N/A',
          type: data.type || 'Trailer',
          status: data.status || 'Active',
          location: data.location || 'Unknown',
          issueCount: trailerIssues.length,
        };
      });

      // Process drivers
      const driverData: Driver[] = Object.entries(mappingsData.drivers || {}).map(([name, rawData]) => {
        const data = rawData as FleetMappingData;
        const driverIssues = issuesData.filter((issue: IssueData) => issue.driverName === name);
        const assignedFleet = fleetData.find(f => f.driver === name);
        return {
          name,
          phone: data.phone || 'N/A',
          employeeId: data.employeeId || 'N/A',
          status: data.status || 'Active',
          assignedFleet: assignedFleet?.fleetNumber,
          issueCount: driverIssues.length,
        };
      });

      setFleetUnits(fleetData);
      setTrailers(trailerData);
      setDrivers(driverData);

      // Calculate stats
      setStats({
        totalFleet: fleetData.length,
        activeFleet: fleetData.filter(f => f.status === 'Active').length,
        inactiveFleet: fleetData.filter(f => f.status !== 'Active').length,
        totalTrailers: trailerData.length,
        activeTrailers: trailerData.filter(t => t.status === 'Active').length,
        totalDrivers: driverData.length,
        activeDrivers: driverData.filter(d => d.status === 'Active').length,
      });

      toast.success('Fleet data loaded');
    } catch (error) {
      console.error('Failed to fetch equipment data:', error);
      toast.error('Failed to load fleet data');
    } finally {
      setLoading(false);
    }
  };

  const exportFleetData = () => {
    const csv = [
      ['Fleet Number', 'Registration', 'Type', 'Status', 'Location', 'Driver', 'Phone', 'Issue Count'].join(','),
      ...filteredFleet.map(f => [
        f.fleetNumber,
        f.rego,
        f.type,
        f.status,
        f.location,
        f.driver,
        f.phone,
        f.issueCount || 0
      ].join(','))
    ].join('\n');

    downloadCSV(csv, 'fleet-units');
  };

  const exportTrailerData = () => {
    const csv = [
      ['Fleet Number', 'Registration', 'Type', 'Status', 'Location', 'Issue Count'].join(','),
      ...filteredTrailers.map(t => [
        t.fleetNumber,
        t.rego,
        t.type,
        t.status,
        t.location,
        t.issueCount || 0
      ].join(','))
    ].join('\n');

    downloadCSV(csv, 'trailers');
  };

  const exportDriverData = () => {
    const csv = [
      ['Name', 'Phone', 'Employee ID', 'Status', 'Assigned Fleet', 'Issue Count'].join(','),
      ...filteredDrivers.map(d => [
        d.name,
        d.phone,
        d.employeeId,
        d.status,
        d.assignedFleet || 'N/A',
        d.issueCount || 0
      ].join(','))
    ].join('\n');

    downloadCSV(csv, 'drivers');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const getBackLink = () => {
    if (accessLevel === 'admin') return '/admin';
    if (accessLevel === 'operations') return '/operations';
    if (accessLevel === 'workshop') return '/workshop';
    return '/';
  };

  if (authLoading || loading) {
    return <LoadingPage text="Loading fleet data..." />;
  }

  if (!isAuthenticated || !['operations', 'workshop', 'admin'].includes(accessLevel || '')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-sm dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href={getBackLink()} className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div className="leading-tight">
                <span className="block text-xs font-semibold uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
                  Fleet
                </span>
                <span className="block text-lg font-bold text-slate-900 dark:text-white">
                  Equipment Overview
                </span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />
            <Button variant="outline" size="default" onClick={logout} className="gap-2 font-semibold">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Hero Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href={getBackLink()}>
              <Button variant="outline" size="default">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl dark:text-white">
                Fleet & Equipment Overview
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mt-2">
                Complete information on all trucks, trailers, and drivers
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fleet Units</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFleet}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeFleet} active, {stats.inactiveFleet} inactive
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Trailers</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTrailers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeTrailers} active
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Drivers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDrivers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeDrivers} active
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalFleet + stats.totalTrailers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fleet units + trailers
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by fleet number, registration, driver, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tabs */}
        <Tabs defaultValue="fleet" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fleet">Fleet Units ({filteredFleet.length})</TabsTrigger>
            <TabsTrigger value="trailers">Trailers ({filteredTrailers.length})</TabsTrigger>
            <TabsTrigger value="drivers">Drivers ({filteredDrivers.length})</TabsTrigger>
          </TabsList>

          {/* Fleet Units Tab */}
          <TabsContent value="fleet" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={exportFleetData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Fleet Data
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredFleet.map((fleet) => (
                <Card key={fleet.fleetNumber} className="hover:shadow-md transition-shadow border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        {fleet.fleetNumber}
                      </CardTitle>
                      <Badge variant={fleet.status === 'Active' ? 'default' : 'secondary'}>
                        {fleet.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-semibold">Registration:</span>
                        <p className="text-muted-foreground">{fleet.rego}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Type:</span>
                        <p className="text-muted-foreground">{fleet.type}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Driver:</span>
                        <p className="text-muted-foreground">{fleet.driver}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Phone:</span>
                        <p className="text-muted-foreground">{fleet.phone}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Location:
                        </span>
                        <p className="text-muted-foreground">{fleet.location}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        {fleet.issueCount && fleet.issueCount > 0 ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <span>{fleet.issueCount} issue{fleet.issueCount > 1 ? 's' : ''} reported</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>No issues</span>
                          </>
                        )}
                      </div>
                      {accessLevel === 'admin' && (
                        <Link href={`/admin/issues?fleet=${fleet.fleetNumber}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Issues
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFleet.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No fleet units found
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Trailers Tab */}
          <TabsContent value="trailers" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={exportTrailerData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Trailer Data
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTrailers.map((trailer) => (
                <Card key={trailer.fleetNumber} className="hover:shadow-md transition-shadow border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {trailer.fleetNumber}
                      </CardTitle>
                      <Badge variant={trailer.status === 'Active' ? 'default' : 'secondary'}>
                        {trailer.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-semibold">Registration:</span>
                        <p className="text-muted-foreground">{trailer.rego}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Type:</span>
                        <p className="text-muted-foreground">{trailer.type}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Location:
                        </span>
                        <p className="text-muted-foreground">{trailer.location}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex items-center gap-2 text-sm">
                      {trailer.issueCount && trailer.issueCount > 0 ? (
                        <>
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          <span>{trailer.issueCount} issue{trailer.issueCount > 1 ? 's' : ''} reported</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>No issues</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTrailers.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No trailers found
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={exportDriverData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Driver Data
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredDrivers.map((driver) => (
                <Card key={driver.name} className="hover:shadow-md transition-shadow border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {driver.name}
                      </CardTitle>
                      <Badge variant={driver.status === 'Active' ? 'default' : 'secondary'}>
                        {driver.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-semibold flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Phone:
                        </span>
                        <p className="text-muted-foreground">{driver.phone}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Employee ID:</span>
                        <p className="text-muted-foreground">{driver.employeeId}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          Assigned Fleet:
                        </span>
                        <p className="text-muted-foreground">{driver.assignedFleet || 'Not assigned'}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        {driver.issueCount && driver.issueCount > 0 ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <span>{driver.issueCount} issue{driver.issueCount > 1 ? 's' : ''} reported</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>No issues</span>
                          </>
                        )}
                      </div>
                      {accessLevel === 'admin' && (
                        <Link href={`/admin/issues?driver=${driver.name}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Issues
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredDrivers.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No drivers found
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
