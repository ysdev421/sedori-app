import { ChevronRight, Package, Smartphone } from 'lucide-react';
import type { Product, PointSiteRedemption } from '@/types';

interface HomeScreenProps {
  products: Product[];
  redemptions: PointSiteRedemption[];
  onSelectSection: (section: 'sedori' | 'keikoji') => void;
}

export function HomeScreen({ products, redemptions, onSelectSection }: HomeScreenProps) {
  const thisYear = new Date().getFullYear();

  const soldThisYear = products.filter((p) => {
    if (p.status !== 'sold' || !p.saleDate) return false;
    return new Date(p.saleDate).getFullYear() === thisYear;
  });

  const sedoriCashProfit = soldThisYear.reduce((sum, p) => {
    const salePrice = p.salePrice ?? 0;
    let cost = p.purchasePrice;
    if (p.purchaseBreakdown) {
      cost =
        p.purchaseBreakdown.cash +
        p.purchaseBreakdown.giftCardUsages.reduce((s, u) => s + u.realCost, 0) +
        p.purchaseBreakdown.pointUse;
    }
    return sum + (salePrice - cost);
  }, 0);

  const redemptionTotal = redemptions
    .filter((r) => r.redeemedAt.startsWith(`${thisYear}-`))
    .reduce((sum, r) => sum + r.amount, 0);

  const sedoriTotalProfit = sedoriCashProfit + redemptionTotal;
  const inventoryCount = products.filter((p) => p.status === 'inventory' || p.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* 年間サマリー */}
      <div className="glass-panel p-5">
        <p className="text-xs text-slate-500 font-semibold mb-1">{thisYear}年 副業合計純利益</p>
        <p className={`text-4xl font-black tracking-tight ${sedoriTotalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          ¥{sedoriTotalProfit.toLocaleString()}
        </p>
        {redemptionTotal > 0 && (
          <p className="text-xs text-slate-400 mt-1">うちポイントサイト還元 ¥{redemptionTotal.toLocaleString()} 含む</p>
        )}
      </div>

      {/* 副業カード */}
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-2 px-1">副業一覧</p>
        <div className="space-y-3">
          {/* せどり */}
          <button
            onClick={() => onSelectSection('sedori')}
            className="w-full glass-panel p-5 flex items-center gap-4 hover:bg-white/90 active:scale-[0.98] transition text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-sky-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900">せどり</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {thisYear}年利益{' '}
                <span className={`font-semibold ${sedoriCashProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ¥{sedoriCashProfit.toLocaleString()}
                </span>
                　在庫 {inventoryCount}件
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
          </button>

          {/* ケーコジ */}
          <button
            onClick={() => onSelectSection('keikoji')}
            className="w-full glass-panel p-5 flex items-center gap-4 hover:bg-white/90 active:scale-[0.98] transition text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900">ケーコジ</p>
              <p className="text-xs text-slate-500 mt-0.5">回線・CB管理</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
