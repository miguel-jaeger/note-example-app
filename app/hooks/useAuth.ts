'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../lib/types';
import { getCurrentUser, logout } from '../lib/auth';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

export function useAuth(redirectIfUnauthenticated = true): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
      setIsLoading(false);

      if (redirectIfUnauthenticated && !userData) {
        router.push('/login');
      }
    };

    checkUser();
  }, [redirectIfUnauthenticated, router]);

  const handleLogout = useCallback(async () => {
    await logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/login');
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: handleLogout,
  };
}