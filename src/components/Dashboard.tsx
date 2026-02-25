import { DollarSign, Package, TrendingUp } from 'lucide-react';
import { calculateProfit, calculateProfitSummary, formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

interface DashboardProps {
  products: Product[];
}

function getMonthKey(dateString?: string): string | null {
  if (!dateString) return null;
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function calcMoM(products: Product[]) {
  const sold = products.filter((p) => p.status === 'sold' && p.saleDate);
  const monthKeys = Array.from(new Set(sold.map((p) => getMonthKey(p.saleDate)).filter(Boolean))).sort();
  const current = monthKeys[monthKeys.length - 1];
  const prev = monthKeys[monthKeys.length - 2];

  if (!current || !prev) {
    return { revenue: null as number | null, profit: null as number | null };
  }

  const sumByMonth = (monthKey: string) => {
    const target = sold.filter((p) => getMonthKey(p.saleDate) === monthKey);
    return {
      revenue: target.reduce((sum, p) => sum + (p.salePrice || 0), 0),
      profit: target.reduce((sum, p) => sum + calculateProfit(p), 0),
    };
  };

  const cur = sumByMonth(current);
  const prv = sumByMonth(prev);

  const calc = (currentVal: number, prevVal: number) => {
    if (prevVal === 0) return null;
    return ((currentVal - prevVal) / Math.abs(prevVal)) * 100;
  };

  return {
    revenue: calc(cur.revenue, prv.revenue),
    profit: calc(cur.profit, prv.profit),
  };
}

function buildMonthlySeries(products: Product[]) {
  const sold = products.filter((p) => p.status === 'sold' && p.saleDate);
  const monthMap = new Map<string, { revenue: number; profit: number }>();

  for (const p of sold) {
    const key = getMonthKey(p.saleDate);
    if (!key) continue;
    const cur = monthMap.get(key) || { revenue: 0, profit: 0 };
    cur.revenue += p.salePrice || 0;
    cur.profit += calculateProfit(p);
    monthMap.set(key, cur);
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, values]) => ({ month, ...values }));
}

function momText(value: number | null) {
  if (value === null) return '前月比 -';
  const sign = value >= 0 ? '+' : '';
  return `前月比 ${sign}${value.toFixed(1)}%`;
}

export function Dashboard({ products }: DashboardProps) {
  const summary = calculateProfitSummary(products);
  const mom = calcMoM(products);
  const monthly = buildMonthlySeries(products);
  const maxRevenue = Math.max(1, ...monthly.map((m) => m.revenue));

  const stats = [
    {
      label: '総売上',
      value: formatCurrency(summary.totalRevenue),
      sub: momText(mom.revenue),
      subTone: mom.revenue === null ? 'text-slate-500' : mom.revenue >= 0 ? 'text-emerald-600' : 'text-rose-600',
      icon: DollarSign,
      tone: 'from-sky-100 to-cyan-100 text-sky-700',
    },
    {
      label: '総利益',
      value: formatCurrency(summary.totalProfit),
      sub: momText(mom.profit),
      subTone: mom.profit === null ? 'text-slate-500' : mom.profit >= 0 ? 'text-emerald-600' : 'text-rose-600',
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
              {stat.sub && <p className={`text-xs mt-1 font-semibold ${stat.subTone}`}>{stat.sub}</p>}
            </div>
          );
        })}
      </div>

      <div className="glass-panel p-5 bg-gradient-to-br from-white/80 to-cyan-50/70">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800">月次グラフ（売上）</h3>
          <p className="text-xs text-soft">直近6か月</p>
        </div>
        {monthly.length === 0 ? (
          <p className="text-sm text-soft">売却データがありません</p>
        ) : (
          <div className="grid grid-cols-6 gap-2 items-end h-40">
            {monthly.map((m) => (
              <div key={m.month} className="flex flex-col items-center justify-end h-full">
                <div className="text-[10px] text-soft mb-1">{Math.round((m.revenue / maxRevenue) * 100)}%</div>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-sky-500 to-cyan-400"
                  style={{ height: `${Math.max(8, (m.revenue / maxRevenue) * 100)}%` }}
                  title={`${m.month} 売上: ${formatCurrency(m.revenue)} / 利益: ${formatCurrency(m.profit)}`}
                />
                <div className="text-[10px] text-soft mt-1">{m.month.slice(5)}月</div>
              </div>
            ))}
          </div>
        )}
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
