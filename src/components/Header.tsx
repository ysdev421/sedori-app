import { Download, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { exportToCSV } from '@/lib/utils';
import type { Product } from '@/types';

interface HeaderProps {
  userName?: string;
  products: Product[];
}

export function Header({ userName, products }: HeaderProps) {
  const { logout } = useAuth();

  const handleExport = () => {
    const date = new Date().toISOString().split('T')[0];
    exportToCSV(products, `sedori-data-${date}.csv`);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/50 border-b border-white/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.18em] text-soft uppercase">Sedori Profit Manager</p>
            <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-cyan-700 via-sky-600 to-blue-700 bg-clip-text text-transparent">
              せどり利益管理
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleExport}
              className="glass-panel px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white/90 transition inline-flex items-center gap-2"
              title="CSVを出力"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">CSV出力</span>
            </button>

            <div className="hidden md:block text-sm text-slate-700 max-w-[220px] truncate">{userName}</div>

            <button
              onClick={logout}
              className="glass-panel p-2.5 text-rose-600 hover:bg-rose-50/80 transition"
              title="ログアウト"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
