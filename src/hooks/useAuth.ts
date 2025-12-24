'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessLevel, setAccessLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      // Check if we're in the browser
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const getCookie = (name: string) => {
        const cookies = document.cookie.split(';').map(c => c.trim());
        const match = cookies.find(c => c.startsWith(`${name}=`));
        return match ? decodeURIComponent(match.split('=')[1] ?? '') : null;
      };

      const auth = sessionStorage.getItem('isAuthenticated') ?? getCookie('accessAuth');
      const level = sessionStorage.getItem('accessLevel') ?? getCookie('accessLevel');
      
      if ((auth === 'true' || auth === '1') && level) {
        setIsAuthenticated(true);
        setAccessLevel(level);
      } else {
        setIsAuthenticated(false);
        setAccessLevel(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('accessLevel');
    document.cookie = 'accessAuth=; Max-Age=0; path=/';
    document.cookie = 'accessLevel=; Max-Age=0; path=/';
    setIsAuthenticated(false);
    setAccessLevel(null);
    router.push('/access');
  };

  const requireAuth = (requiredLevel?: string) => {
    if (!isAuthenticated) {
      router.push('/access');
      return false;
    }
    
    if (requiredLevel && accessLevel !== requiredLevel) {
      router.push('/access');
      return false;
    }
    
    return true;
  };

  return {
    isAuthenticated,
    accessLevel,
    loading,
    logout,
    requireAuth
  };
}
