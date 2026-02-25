import { useMemo, useState } from 'react';
import { CircleDollarSign, Edit, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { SaleForm } from './SaleForm';
import { EditProductForm } from './EditProductForm';
import { calculatePointProfit, calculateProfit, formatCurrency, formatDate } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductListProps {
  products: Product[];
  userId: string;
  onDelete: (id: string) => void;
}

type StatusFilter = 'all' | 'pending' | 'inventory' | 'sold';
type SortKey = 'purchaseDateDesc' | 'profitDesc' | 'salePriceDesc';

export function ProductList({ products, userId, onDelete }: ProductListProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [query, setQuery] = useState('');
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  const nextMonthStart = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, 1);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [fromDate, setFromDate] = useState(fmt(currentMonthStart));
  const [toDate, setToDate] = useState(fmt(new Date(nextMonthStart.getTime() - 1)));
  const [sortKey, setSortKey] = useState<SortKey>('purchaseDateDesc');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = products.filter((p) => {
      if (statusFilter === 'pending') {
        if (!(p.status === 'pending' || p.status === 'inventory')) return false;
      } else if (statusFilter !== 'all' && p.status !== statusFilter) {
        return false;
      }

      if (fromDate && p.purchaseDate < fromDate) return false;
      if (toDate && p.purchaseDate > toDate) return false;

      if (!q) return true;
      const haystack = [p.productName, p.purchaseLocation, p.saleLocation || '', p.channel || ''].join(' ').toLowerCase();
      return haystack.includes(q);
    });

    return list.sort((a, b) => {
      if (sortKey === 'profitDesc') {
        return calculateProfit(b) - calculateProfit(a);
      }
      if (sortKey === 'salePriceDesc') {
        return (b.salePrice || 0) - (a.salePrice || 0);
      }
      return b.purchaseDate.localeCompare(a.purchaseDate);
    });
  }, [products, query, statusFilter, fromDate, toDate, sortKey]);

  const pending = filtered.filter((p) => p.status === 'pending');
  const sold = filtered.filter((p) => p.status === 'sold');
  const inventory = filtered.filter((p) => p.status === 'inventory');

  const statusBadge = (status: Product['status']) => {
    if (status === 'sold') return 'bg-emerald-100 text-emerald-700';
    if (status === 'inventory') return 'bg-sky-100 text-sky-700';
    return 'bg-slate-100 text-slate-700';
  };

  const statusLabel = (status: Product['status']) => {
    if (status === 'sold') return '売却済み';
    if (status === 'inventory') return '在庫';
    return '待機中';
  };

  const channelLabel = (channel?: Product['channel']) => {
    if (channel === 'ebay') return { text: 'eBay', cls: 'bg-indigo-100 text-indigo-700' };
    if (channel === 'kaitori') return { text: '買取流し', cls: 'bg-purple-100 text-purple-700' };
    return { text: '未分類', cls: 'bg-slate-100 text-slate-700' };
  };

  const section = (title: string, color: string, items: Product[]) => {
    if (items.length === 0) return null;

    return (
      <section>
        <h2 className="mb-3 text-sm font-bold tracking-wide">
          <span className={`inline-flex items-center rounded-full px-3 py-1 ${color}`}>{title} {items.length}</span>
        </h2>
        <div className="space-y-3">{items.map(renderProductCard)}</div>
      </section>
    );
  };

  const renderProductCard = (product: Product) => (
    <div key={product.id} className="card p-4 animate-fade-in">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 truncate">{product.productName}</h3>
          <p className="text-xs text-soft mt-1">
            {formatDate(product.purchaseDate)} / {product.purchaseLocation}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-soft">購入価格</p>
              <p className="font-semibold text-slate-900">{formatCurrency(product.purchasePrice)}</p>
            </div>
            <div>
              <p className="text-xs text-soft">ポイント</p>
              <p className="font-semibold text-slate-900">-{formatCurrency(product.point)}</p>
            </div>
          </div>

          <div className="mt-3">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(product.status)}`}>
              {statusLabel(product.status)}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ml-2 ${channelLabel(product.channel).cls}`}
            >
              {channelLabel(product.channel).text}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setEditingProduct(product)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
            title="編集"
          >
            <Edit className="w-5 h-5" />
          </button>

          {product.status !== 'sold' && (
            <button
              onClick={() => setSelectedProduct(product)}
              className="p-2 rounded-xl text-sky-600 hover:bg-sky-50 transition"
              title="売却情報を入力"
            >
              <CircleDollarSign className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => onDelete(product.id)}
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
            title="削除"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {product.status === 'sold' && product.salePrice && (
        <div className="mt-4 pt-4 border-t border-white/60 grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-soft">売却価格</p>
            <p className="font-semibold text-slate-900">{formatCurrency(product.salePrice)}</p>
          </div>
          <div>
            <p className="text-xs text-soft">利益</p>
            <p className={`font-semibold ${calculateProfit(product) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {formatCurrency(calculateProfit(product))}
            </p>
          </div>
          <div>
            <p className="text-xs text-soft">P利益</p>
            <p className={`font-semibold ${calculatePointProfit(product) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {formatCurrency(calculatePointProfit(product))}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="glass-panel p-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="商品名・購入場所・売却先で検索"
              className="input-field pl-9"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-white/80 transition inline-flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            条件
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="input-field">
              <option value="all">ステータス: すべて</option>
              <option value="pending">未着/待機+在庫</option>
              <option value="sold">売却済み</option>
              <option value="inventory">在庫のみ</option>
            </select>

            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input-field" />
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input-field" />

            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="input-field">
              <option value="purchaseDateDesc">並び順: 購入日が新しい順</option>
              <option value="profitDesc">並び順: 利益が高い順</option>
              <option value="salePriceDesc">並び順: 売却価格が高い順</option>
            </select>
          </div>
        )}
      </div>

      <div className="text-xs text-soft px-1">検索結果 {filtered.length} 件</div>

      <div className="space-y-7">
        {section('待機中', 'bg-slate-100 text-slate-700', pending)}
        {section('在庫', 'bg-sky-100 text-sky-700', inventory)}
        {section('売却済み', 'bg-emerald-100 text-emerald-700', sold)}
      </div>

      {selectedProduct && (
        <SaleForm product={selectedProduct} userId={userId} onClose={() => setSelectedProduct(null)} />
      )}
      {editingProduct && (
        <EditProductForm product={editingProduct} userId={userId} onClose={() => setEditingProduct(null)} />
      )}
    </div>
  );
}
