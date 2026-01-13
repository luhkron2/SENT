'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, Settings, Truck, ArrowRight, Shield, Eye, EyeOff, Sparkles, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ACCESS_LEVELS = {
  driver: {
    name: 'Driver',
    description: 'Report vehicle issues quickly',
    icon: Truck,
    requiresPassword: false,
    redirect: '/report',
    gradient: 'from-blue-500 to-blue-600',
    bgGlow: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30 hover:border-blue-400/50',
  },
  operations: {
    name: 'Operations',
    description: 'Fleet oversight & scheduling',
    icon: Settings,
    requiresPassword: true,
    redirect: '/operations',
    gradient: 'from-purple-500 to-purple-600',
    bgGlow: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30 hover:border-purple-400/50',
  },
  workshop: {
    name: 'Workshop',
    description: 'Repair queue & job tracking',
    icon: Wrench,
    requiresPassword: true,
    redirect: '/workshop',
    gradient: 'from-orange-500 to-orange-600',
    bgGlow: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30 hover:border-orange-400/50',
  },
  admin: {
    name: 'Admin',
    description: 'Full system control',
    icon: Shield,
    requiresPassword: true,
    redirect: '/admin',
    gradient: 'from-rose-500 to-rose-600',
    bgGlow: 'bg-rose-500/20',
    borderColor: 'border-rose-500/30 hover:border-rose-400/50',
  }
};

interface QuickStat {
  label: string;
  value: string;
  icon: typeof AlertTriangle;
  color: string;
}

const QUICK_STATS: QuickStat[] = [
  { label: 'Active Issues', value: '—', icon: AlertTriangle, color: 'text-amber-400' },
  { label: 'Completed Today', value: '—', icon: CheckCircle2, color: 'text-green-400' },
  { label: 'Avg Response', value: '—', icon: Clock, color: 'text-blue-400' },
];

export default function HomePage() {
  const [selectedAccess, setSelectedAccess] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stats, setStats] = useState<QuickStat[]>(QUICK_STATS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch quick stats
    fetch('/api/metrics')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setStats([
            { label: 'Active Issues', value: String(data.activeIssues ?? '—'), icon: AlertTriangle, color: 'text-amber-400' },
            { label: 'Completed Today', value: String(data.completedToday ?? '—'), icon: CheckCircle2, color: 'text-green-400' },
            { label: 'Avg Response', value: data.avgResponseTime ? `${data.avgResponseTime}h` : '—', icon: Clock, color: 'text-blue-400' },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const handleAccessSelect = (accessType: string) => {
    const accessConfig = ACCESS_LEVELS[accessType as keyof typeof ACCESS_LEVELS];
    
    if (!accessConfig.requiresPassword) {
      window.location.href = accessConfig.redirect;
      return;
    }
    
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
        toast.success('Access granted!');
        window.location.href = data.redirect;
      } else {
        toast.error(data.error || 'Invalid password');
        setPassword('');
        setLoading(false);
      }
    } catch {
      toast.error('An error occurred');
      setPassword('');
      setLoading(false);
    }
  };

  if (selectedAccess) {
    const accessConfig = ACCESS_LEVELS[selectedAccess as keyof typeof ACCESS_LEVELS];
    const IconComponent = accessConfig.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        {/* Background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={cn("absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20", accessConfig.bgGlow)} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl" />
        </div>

        <Card className={cn(
          "relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border-2 shadow-2xl",
          accessConfig.borderColor
        )}>
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className={cn(
                "mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                accessConfig.gradient
              )}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{accessConfig.name} Portal</h1>
                <p className="text-slate-400 mt-1">Enter your password to continue</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 pr-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-slate-500 focus:ring-slate-500/20"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedAccess(null)} 
                  className="flex-1 h-12 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className={cn(
                    "flex-1 h-12 text-white font-semibold bg-gradient-to-r shadow-lg",
                    accessConfig.gradient
                  )}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Access Portal
                    </span>
                  )}
                </Button>
              </div>
            </form>

            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Dev Passwords
                </p>
                <p>Operations: <code className="text-blue-400">SENATIONAL07</code></p>
                <p>Workshop: <code className="text-orange-400">SENATIONAL04</code></p>
                <p>Admin: <code className="text-rose-400">admin123</code></p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-5xl space-y-10">
          {/* Header */}
          <header className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Fleet Management System
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Wrench className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">SE Repairs</h1>
            </div>
            <p className="text-slate-400 text-lg max-w-md mx-auto">
              Streamlined fleet maintenance and repair tracking for your entire operation
            </p>
          </header>

          {/* Quick Stats */}
          {mounted && (
            <div className="flex justify-center gap-6 sm:gap-10">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className={cn("text-2xl sm:text-3xl font-bold", stat.color)}>{stat.value}</div>
                  <div className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center justify-center gap-1.5">
                    <stat.icon className="w-3.5 h-3.5" />
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Access Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {Object.entries(ACCESS_LEVELS).map(([key, config]) => {
              const IconComponent = config.icon;
              return (
                <Card
                  key={key}
                  className={cn(
                    "group cursor-pointer bg-slate-900/60 backdrop-blur-sm border-2 transition-all duration-300",
                    "hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-900/50",
                    config.borderColor
                  )}
                  onClick={() => handleAccessSelect(key)}
                >
                  <CardContent className="p-5 sm:p-6 text-center space-y-4">
                    <div className={cn(
                      "mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center",
                      "shadow-lg transition-transform duration-300 group-hover:scale-110",
                      config.gradient
                    )}>
                      <IconComponent className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-lg">{config.name}</h3>
                      <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">{config.description}</p>
                    </div>
                    <Button 
                      className={cn(
                        "w-full h-10 text-white font-semibold bg-gradient-to-r shadow-md",
                        "transition-all duration-300 group-hover:shadow-lg",
                        config.gradient
                      )}
                      size="sm"
                    >
                      {config.requiresPassword ? (
                        <span className="flex items-center gap-1.5">
                          <Shield className="h-4 w-4" />
                          Access
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <ArrowRight className="h-4 w-4" />
                          Enter
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Footer */}
          <footer className="text-center space-y-3 pt-4">
            <p className="text-slate-500 text-sm">
              Need help? Contact <a href="mailto:workshop@senational.com.au" className="text-blue-400 hover:text-blue-300 transition-colors">workshop@senational.com.au</a>
            </p>
            <p className="text-slate-600 text-xs">
              © {new Date().getFullYear()} SE Repairs. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}