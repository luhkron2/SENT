'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, Settings, Truck, CheckCircle2, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const ACCESS_LEVELS = {
  driver: {
    name: 'Driver',
    description: 'Report vehicle issues and track repairs',
    icon: Truck,
    requiresPassword: false,
    redirect: '/report',
    color: 'from-blue-500 to-blue-600',
    highlights: [
      'Quick photo capture for issue reporting',
      'Track your submitted repair tickets in real-time',
      'Offline support with automatic sync when back online'
    ]
  },
  operations: {
    name: 'Operations',
    description: 'Manage operations and view all reports',
    icon: Settings,
    requiresPassword: true,
    redirect: '/operations',
    color: 'from-purple-500 to-purple-600',
    highlights: [
      'Monitor and triage new incident reports in real-time',
      'Assign workshop actions and track fleet availability',
      'Export compliance-ready summaries for leadership'
    ]
  },
  workshop: {
    name: 'Workshop',
    description: 'Manage repairs and workshop operations',
    icon: Wrench,
    requiresPassword: true,
    redirect: '/workshop',
    color: 'from-orange-500 to-orange-600',
    highlights: [
      'See the live repair queue with priority indicators',
      'Update job progress and attach completion notes',
      'Coordinate with operations for parts and scheduling'
    ]
  }
};

export default function HomePage() {
  const [selectedAccess, setSelectedAccess] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAccessSelect = (accessType: string) => {
    const accessConfig = ACCESS_LEVELS[accessType as keyof typeof ACCESS_LEVELS];
    
    // If driver access (no password required), redirect immediately
    if (!accessConfig.requiresPassword) {
      toast.success(`Welcome, ${accessConfig.name}!`);
      window.location.href = accessConfig.redirect;
      return;
    }
    
    // Otherwise, show password prompt
    setSelectedAccess(accessType);
    setPassword('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccess) return;

    setLoading(true);

    try {
      const response = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessType: selectedAccess, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store access level in session storage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('accessLevel', selectedAccess);
          sessionStorage.setItem('isAuthenticated', 'true');
        }
        
        const accessConfig = ACCESS_LEVELS[selectedAccess as keyof typeof ACCESS_LEVELS];
        toast.success(`Welcome to ${accessConfig.name}!`);
        window.location.href = data.redirect;
      } else {
        toast.error(data.error || 'Invalid password. Please try again.');
        setPassword('');
        setLoading(false);
      }
    } catch {
      toast.error('An error occurred. Please try again.');
      setPassword('');
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedAccess(null);
    setPassword('');
  };

  if (selectedAccess) {
    const accessConfig = ACCESS_LEVELS[selectedAccess as keyof typeof ACCESS_LEVELS];
    const IconComponent = accessConfig.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${accessConfig.color} flex items-center justify-center shadow-lg`}>
                <IconComponent className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="uppercase tracking-[0.35em] text-[0.65rem] text-blue-300 font-semibold">
                Step 2 of 2 • Authentication
              </p>
              <CardTitle className="text-2xl font-bold text-white">{accessConfig.name} Access</CardTitle>
              <CardDescription className="text-base text-blue-200">{accessConfig.description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-blue-900/40 border border-blue-700/50">
              <p className="text-sm text-blue-100">
                For security, this area is limited to SE Repairs staff. Enter the latest passphrase to continue.
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-semibold text-white">Enter Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pr-10 h-12 text-base bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus-ring focus:border-blue-400 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 hover:scale-110 transition-all"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row pt-2">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1 h-12 border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700 hover:border-slate-500 transition-all hover-lift">
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white btn-shimmer transition-all hover:shadow-lg hover:shadow-blue-500/30">
                  {loading ? 'Verifying...' : 'Access Dashboard'}
                </Button>
              </div>
            </form>
            <div className="rounded-xl border border-amber-700/50 bg-amber-900/20 p-4 text-left">
              <p className="font-semibold text-sm text-amber-200 mb-1">💡 Tip</p>
              <p className="text-xs text-amber-100/90">Passwords rotate regularly. If you need the latest passphrase, contact operations leadership.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl animate-fade-in-up">
        {/* Staff Login Button - Top Right */}
        <div className="flex justify-end mb-4 animate-slide-right">
          <Button
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all hover-lift hover-glow-effect"
          >
            <Shield className="w-4 h-4 mr-2" />
            Staff Login
          </Button>
        </div>

        <div className="text-center mb-12 space-y-6">
          <div className="flex items-center justify-center gap-3 mb-6 animate-float">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl hover-glow-effect transition-all">
              <Wrench className="h-8 w-8 text-white transition-transform hover:rotate-12" />
            </div>
            <span className="text-4xl font-bold tracking-tight text-white text-gradient">
              SE Repairs
            </span>
          </div>
          <div className="space-y-3">
            <p className="uppercase tracking-[0.35em] text-xs text-blue-300 font-semibold">
              Step 1 of 2 • Access Selection
            </p>
            <h1 className="text-5xl font-bold text-white tracking-tight">
              Welcome to SE Repairs
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Fleet Management & Repair Tracking System
            </p>
            <p className="text-base text-slate-300 max-w-xl mx-auto">
              Select your role to access the appropriate dashboard and tools
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {Object.entries(ACCESS_LEVELS).map(([key, config], index) => {
            const IconComponent = config.icon;
            return (
              <Card
                key={key}
                className="group relative h-full cursor-pointer overflow-hidden rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                onClick={() => handleAccessSelect(key)}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-40" 
                     style={{ background: `linear-gradient(to bottom right, ${config.color.split(' ')[1]}, ${config.color.split(' ')[3]})` }} />
                <CardHeader className="space-y-4 text-center relative z-10 pb-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
                       style={{ background: `linear-gradient(to bottom right, ${config.color.split(' ')[1]}, ${config.color.split(' ')[3]})` }}>
                    <IconComponent className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl font-bold text-white">
                      {config.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-blue-100">
                      {config.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4 px-6 pb-6">
                  <ul className="space-y-2 text-sm">
                    {config.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-200">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
                        <span className="text-slate-100">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full justify-center gap-2 text-base h-11 shadow-lg transition-all hover:shadow-xl hover:scale-105"
                    style={{ background: `linear-gradient(to right, ${config.color.split(' ')[1]}, ${config.color.split(' ')[3]})` }}
                  >
                    {config.requiresPassword ? (
                      <>
                        <Shield className="h-4 w-4" />
                        Access {config.name}
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4" />
                        Enter {config.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </div>
  );
}
