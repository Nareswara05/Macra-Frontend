'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiGrid, FiShoppingBag, FiActivity, FiClock, FiUser, FiLogOut,
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard',  Icon: FiGrid },
  { href: '/konsumsi',  label: 'Makanan',    Icon: FiShoppingBag },
  { href: '/aktivitas', label: 'Aktivitas',  Icon: FiActivity },
  { href: '/history',   label: 'Riwayat',    Icon: FiClock },
  { href: '/profile',   label: 'Profil',     Icon: FiUser },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initial     = (user?.nama || user?.email || 'U').charAt(0).toUpperCase();
  const displayName = user?.nama || user?.email?.split('@')[0] || 'Pengguna';

  return (
    <>
      {/* ── Sidebar (desktop) ────────────────────────────────── */}
      <aside className="hidden md:flex w-[248px] min-h-screen bg-surface flex-col fixed top-0 left-0 z-100 border-r border-border-light">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-border-light flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] rounded-lg shrink-0 bg-primary-light border border-primary/30 flex items-center justify-center text-[17px]">
            🥗
          </div>
          <div>
            <div className="text-[15px] font-bold text-text-primary tracking-tight">Macra</div>
            <div className="text-[9px] text-primary uppercase tracking-[0.8px]">Nutrition Tracker</div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href} href={href}
                className={[
                  'flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm no-underline transition-all duration-[140ms]',
                  active
                    ? 'font-semibold text-primary bg-primary-light border border-primary/20'
                    : 'font-normal text-text-secondary bg-transparent border border-transparent hover:bg-white/[0.04] hover:text-text-primary',
                ].join(' ')}
              >
                <Icon size={15} className="shrink-0" />
                <span className="flex-1">{label}</span>
                {active && (
                  <span className="w-[5px] h-[5px] rounded-full bg-primary shrink-0 shadow-[0_0_6px_rgba(63,185,80,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-2 py-2.5 border-t border-border-light">
          <div className="flex items-center gap-2 p-2.5 rounded-lg mb-1 bg-white/[0.03] border border-border-light">
            <div className="w-[30px] h-[30px] rounded-full shrink-0 bg-primary/20 text-primary flex items-center justify-center text-[13px] font-bold border border-primary/30">
              {initial}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[13px] font-semibold text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">
                {displayName}
              </div>
              <div className="text-[11px] text-text-muted overflow-hidden text-ellipsis whitespace-nowrap">
                {user?.email}
              </div>
            </div>
          </div>
          <button
            id="logout-btn"
            onClick={logout}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border-none bg-transparent cursor-pointer text-[13px] text-text-muted font-[inherit] transition-all duration-[140ms] hover:bg-lemak-bg hover:text-lemak"
          >
            <FiLogOut size={14} /> Keluar
          </button>
        </div>
      </aside>

      {/* ── Bottom nav (mobile) ─────────────────────────────── */}
      <nav className="flex md:hidden fixed z-10 bottom-0 left-0 right-0 z-100 bg-surface border-t border-border-light px-1 pt-1.5 pb-2.5">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href} href={href}
              className={[
                'flex flex-col items-center gap-0.5 flex-1 no-underline text-[9px] tracking-[0.3px] transition-colors duration-[140ms]',
                active ? 'font-semibold text-primary' : 'font-normal text-text-muted',
              ].join(' ')}
            >
              <div className={[
                'w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-[140ms] mb-0.5',
                active ? 'bg-primary-light' : 'bg-transparent',
              ].join(' ')}>
                <Icon size={17} />
              </div>
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
