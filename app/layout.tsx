import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Macra — Calorie & Nutrition Tracker',
  description: 'Track your daily calorie and nutrition intake with Macra.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark scroll-smooth h-full">
      <body className="antialiased bg-bg text-text-primary min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
