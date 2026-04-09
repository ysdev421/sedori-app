import { useState } from 'react';
import { ChevronLeft, KeyRound, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';

interface HeaderProps {
  userName?: string;
  appSection?: 'home' | 'sedori' | 'keikoji' | 'annualSummary';
  onBack?: () => void;
}

const SECTION_LABELS: Record<string, { sub: string; title: string }> = {
  home: { sub: 'Side Business Portfolio', title: 'SideFolio' },
  sedori: { sub: 'Resale Management', title: 'せどり管理' },
  keikoji: { sub: 'MNP Management', title: '回線案件管理' },
  annualSummary: { sub: 'Annual Summary', title: '年間サマリー' },
};

export function Header({ userName, appSection = 'home', onBack }: HeaderProps) {
  const { logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const label = SECTION_LABELS[appSection] ?? SECTION_LABELS.home;

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {appSection !== 'home' && onBack && (
                <button
                  onClick={onBack}
                  className="p-1.5 rounded-lg transition -ml-1 bg-white/65 hover:bg-white"
                  title="ホームに戻る"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
              )}
              <div>
                <p className="text-xs tracking-[0.14em] text-soft uppercase font-semibold">{label.sub}</p>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {label.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:block text-sm text-slate-700 max-w-[220px] truncate">{userName}</div>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="glass-panel p-2.5 text-slate-700 hover:bg-white/95 transition"
                title="パスワード変更"
              >
                <KeyRound className="w-5 h-5" />
              </button>

              <button
                onClick={logout}
                className="glass-panel p-2.5 text-rose-600 hover:bg-rose-50/90 transition"
                title="ログアウト"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </>
  );
}

