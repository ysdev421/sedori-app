import { DollarSign, Package, TrendingUp } from 'lucide-react';
import { calculateProfitSummary, formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

interface DashboardProps {
  products: Product[];
}

export function Dashboard({ products }: DashboardProps) {
  const summary = calculateProfitSummary(products);

  const stats = [
    {
      label: '総売上',
      value: formatCurrency(summary.totalRevenue),
      icon: DollarSign,
      tone: 'from-sky-100 to-cyan-100 text-sky-700',
    },
    {
      label: '総利益',
      value: formatCurrency(summary.totalProfit),
      icon: TrendingUp,
      tone: 'from-emerald-100 to-green-100 text-emerald-700',
      negative: summary.totalProfit < 0,
    },
    {
      label: 'P利益',
      value: formatCurrency(summary.totalPointProfit),
      icon: TrendingUp,
      tone: 'from-teal-100 to-emerald-100 text-teal-700',
    },
    {
      label: '在庫評価',
      value: formatCurrency(summary.inventoryValue),
      icon: Package,
      tone: 'from-amber-100 to-orange-100 text-amber-700',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card p-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.tone} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs text-soft font-semibold tracking-wide">{stat.label}</p>
              <p className={`text-2xl font-black mt-1 ${stat.negative ? 'text-rose-600' : 'text-slate-900'}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="glass-panel p-5 bg-gradient-to-br from-white/80 to-cyan-50/70">
        <h3 className="font-bold text-slate-800 mb-3">サマリー</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-soft">商品数</p>
            <p className="font-bold text-lg text-slate-900">{summary.totalProducts}</p>
          </div>
          <div>
            <p className="text-soft">売却済み</p>
            <p className="font-bold text-lg text-emerald-700">{summary.soldCount}</p>
          </div>
          <div>
            <p className="text-soft">待機/未着</p>
            <p className="font-bold text-lg text-slate-900">{summary.waitingCount}</p>
          </div>
          <div>
            <p className="text-soft">利益率</p>
            <p className="font-bold text-lg text-slate-900">
              {summary.totalRevenue > 0 ? `${((summary.totalProfit / summary.totalRevenue) * 100).toFixed(1)}%` : '0%'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
