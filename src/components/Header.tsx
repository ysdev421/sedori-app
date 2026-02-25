import { LogOut, Download, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { exportToCSV } from '@/lib/utils';
import type { Product } from '@/types';

interface HeaderProps {
  userName?: string;
  products: Product[];
  onMenuClick?: () => void;
}

export function Header({ userName, products, onMenuClick }: HeaderProps) {
  const { logout } = useAuth();

  const handleExport = () => {
    const date = new Date().toISOString().split('T')[0];
    exportToCSV(products, `sedori-data-${date}.csv`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              📊 せどり管理
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title="CSVをエクスポート"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">エクスポート</span>
            </button>

            <div className="hidden sm:flex items-center gap-3 ml-3 pl-3 border-l border-gray-200">
              {userName && (
                <span className="text-sm text-gray-700">{userName}</span>
              )}
              <button
                onClick={logout}
                className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                title="ログアウト"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
