'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../lib/types';
import { getCurrentUser, logout } from '../lib/auth';
import { authStorage } from '../lib/storage';

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
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMounted.current = true;
    abortControllerRef.current = new AbortController();

    const checkUser = async () => {
      try {
        const userData = await getCurrentUser();
        if (isMounted.current) {
          setUser(userData);
          setIsLoading(false);

          if (redirectIfUnauthenticated && !userData) {
            router.push('/login');
          }
        }
      } catch {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    checkUser();

    return () => {
      isMounted.current = false;
      abortControllerRef.current?.abort();
    };
  }, [redirectIfUnauthenticated, router]);

  const handleLogout = useCallback(async () => {
    await logout();
    authStorage.clear();
    router.push('/login');
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: handleLogout,
  };
}