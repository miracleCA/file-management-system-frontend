'use client';

import { useEffect } from 'react';
import Header from './header';
import Sidebar from './sidebar';
import { useRouter } from 'next/navigation';
import { RootState } from '@/context/store';
import { useSelector } from 'react-redux';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
