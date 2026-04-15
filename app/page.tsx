'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from './lib/auth';
import { LoadingSpinner } from './components';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}