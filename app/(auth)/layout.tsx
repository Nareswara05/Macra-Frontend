export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const features = [
    { icon: '🎯', title: 'Target personal', desc: 'Sesuai data fisik & aktivitas kamu' },
    { icon: '📊', title: 'Statistik harian', desc: 'Visual yang jelas dan mudah dibaca' },
    { icon: '⚡', title: 'Catat dengan cepat', desc: 'Form yang simpel, sekali input langsung tersimpan' },
  ];

  return (
    <div className="min-h-screen flex bg-bg">
      {/* ── Left branding panel (hidden on mobile) ──────────── */}
      <div className="hidden md:flex w-[440px] shrink-0 flex-col justify-between py-12 px-11 relative overflow-hidden border-r border-[#1a3020]"
        style={{ background: 'linear-gradient(160deg, #0f2d1a 0%, #0d1f12 50%, #0d1117 100%)' }}>

        {/* Decorations */}
        <div className="absolute -top-[120px] -right-[120px] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(63,185,80,0.08) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-[80px] -left-[80px] w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(63,185,80,0.04) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-15">
            <div className="w-10 h-10 rounded-[10px] shrink-0 bg-primary-light border border-primary/30 flex items-center justify-center text-[20px]">🥗</div>
            <div>
              <div className="text-[18px] font-bold text-text-primary tracking-tight">Macra</div>
              <div className="text-[10px] text-primary uppercase tracking-[1px]">Nutrition Tracker</div>
            </div>
          </div>

          <h1 className="text-[34px] font-bold text-text-primary leading-[1.2] tracking-[-0.8px] mb-3.5">
            Kenali tubuhmu,<br />
            <span className="text-gradient">capai targetmu.</span>
          </h1>
          <p className="text-sm text-text-secondary leading-[1.7] mb-13">
            Pantau kalori dan nutrisi harian kamu dengan mudah. Mulai perjalanan hidup sehat hari ini.
          </p>

          <div className="flex flex-col gap-3.5">
            {features.map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg shrink-0 bg-primary-light border border-primary/20 flex items-center justify-center text-[17px]">
                  {item.icon}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-text-primary mb-0.5">{item.title}</div>
                  <div className="text-[12px] text-text-secondary">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[12px] text-text-muted">© 2026 Macra. All rights reserved.</div>
      </div>

      {/* ── Right form area ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto bg-bg">
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </div>
    </div>
  );
}
