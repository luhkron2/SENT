'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, Settings, Truck, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const ACCESS_LEVELS = {
  driver: {
    name: 'Driver',
    description: 'Report vehicle issues',
    icon: Truck,
    requiresPassword: false,
    redirect: '/report',
    color: 'bg-blue-600 hover:bg-blue-700',
  },
  operations: {
    name: 'Operations',
    description: 'Manage operations',
    icon: Settings,
    requiresPassword: true,
    redirect: '/operations',
    color: 'bg-purple-600 hover:bg-purple-700',
  },
  workshop: {
    name: 'Workshop',
    description: 'Manage repairs',
    icon: Wrench,
    requiresPassword: true,
    redirect: '/workshop',
    color: 'bg-orange-600 hover:bg-orange-700',
  },
  admin: {
    name: 'Admin',
    description: 'System administration',
    icon: Shield,
    requiresPassword: true,
    redirect: '/admin',
    color: 'bg-red-600 hover:bg-red-700',
  }
};

export default function HomePage() {
  const [selectedAccess, setSelectedAccess] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className={`mx-auto w-16 h-16 rounded-full ${accessConfig.color} flex items-center justify-center mb-4`}>
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">{accessConfig.name} Access</CardTitle>
            <CardDescription className="text-slate-400">Enter password to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="pr-10 bg-slate-700 border-slate-600 text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedAccess(null)} 
                  className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className={`flex-1 ${accessConfig.color} text-white`}
                >
                  {loading ? 'Verifying...' : 'Access'}
                </Button>
              </div>
            </form>

            {/* Dev passwords hint */}
            <div className="mt-4 p-3 bg-slate-700/50 rounded-lg text-xs text-slate-400">
              <p className="font-semibold mb-1">Test Passwords:</p>
              <p>Operations: SENATIONAL07</p>
              <p>Workshop: SENATIONAL04</p>
              <p>Admin: admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">SE Repairs</span>
          </div>
          <p className="text-slate-400">Fleet Management & Repair Tracking</p>
        </div>

        {/* Access Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(ACCESS_LEVELS).map(([key, config]) => {
            const IconComponent = config.icon;
            return (
              <Card
                key={key}
                className="cursor-pointer bg-slate-800 border-slate-700 hover:border-slate-500 transition-all hover:-translate-y-1"
                onClick={() => handleAccessSelect(key)}
              >
                <CardContent className="pt-6 text-center">
                  <div className={`mx-auto w-14 h-14 rounded-xl ${config.color} flex items-center justify-center mb-3`}>
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{config.name}</h3>
                  <p className="text-xs text-slate-400 mb-3">{config.description}</p>
                  <Button 
                    className={`w-full ${config.color} text-white`}
                    size="sm"
                  >
                    {config.requiresPassword ? (
                      <>
                        <Shield className="h-4 w-4 mr-1" />
                        Access
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Enter
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Need help? Contact operations at workshop@senational.com.au</p>
        </div>
      </div>
    </div>
  );
}