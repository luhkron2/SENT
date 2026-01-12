'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessLevel, setAccessLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // First check sessionStorage (fast path)
    const auth = sessionStorage.getItem('isAuthenticated');
    const level = sessionStorage.getItem('accessLevel');
    
    if (auth === 'true' && level) {
      setIsAuthenticated(true);
      setAccessLevel(level);
      setLoading(false);
      return;
    }

    // If not in sessionStorage, check with server for httpOnly cookie
    try {
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.accessLevel) {
          setIsAuthenticated(true);
          setAccessLevel(data.accessLevel);
          // Sync to sessionStorage
          sessionStorage.setItem('isAuthenticated', 'true');
          sessionStorage.setItem('accessLevel', data.accessLevel);
        } else {
          setIsAuthenticated(false);
          setAccessLevel(null);
        }
      } else {
        setIsAuthenticated(false);
        setAccessLevel(null);
      }
    } catch {
      setIsAuthenticated(false);
      setAccessLevel(null);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    // Clear sessionStorage
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('accessLevel');
    
    // Clear server cookie
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Ignore errors
    }
    
    setIsAuthenticated(false);
    setAccessLevel(null);
    router.push('/');
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
