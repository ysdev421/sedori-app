import { DollarSign, TrendingUp, Package } from 'lucide-react';
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
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: '総利益',
      value: formatCurrency(summary.totalProfit),
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
      highlight: summary.totalProfit >= 0,
    },
    {
      label: 'P利益',
      value: formatCurrency(summary.totalPointProfit),
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: '在庫',
      value: formatCurrency(summary.inventoryValue),
      icon: Package,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
              <p className={`text-xl font-bold mt-1 ${stat.highlight === false ? 'text-red-600' : 'text-gray-900'}`}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">サマリー</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">商品登録数</span>
            <span className="font-semibold text-gray-900">{summary.totalProducts}件</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">売却済</span>
            <span className="font-semibold text-green-600">{summary.soldCount}件</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">待機中/未着</span>
            <span className="font-semibold text-gray-900">{summary.waitingCount}件</span>
          </div>
          <div className="border-t border-sky-200 pt-2 mt-2 flex justify-between">
            <span className="text-gray-600">利益率</span>
            <span className="font-semibold text-gray-900">
              {summary.totalRevenue > 0
                ? `${((summary.totalProfit / summary.totalRevenue) * 100).toFixed(1)}%`
                : '0%'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
