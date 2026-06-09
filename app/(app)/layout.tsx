'use client';

import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import MacraChat from '@/components/MacraChat';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-bg">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-border-light border-t-primary animate-spin mx-auto mb-3.5" />
        <p className="text-text-muted text-[13px]">Memuat sesi...</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-bg">
      <Navbar />
      {/* desktop: margin-left for sidebar; mobile: padding-bottom for bottom nav */}
      <main className="flex-1 min-h-screen bg-bg min-w-0 overflow-hidden md:ml-[248px] pb-20 md:pb-0">
        {children}
      </main>
      <MacraChat />
    </div>
  );
}
