import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { SaleForm } from './SaleForm';
import { calculatePointProfit, calculateProfit, formatCurrency, formatDate } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductListProps {
  products: Product[];
  userId: string;
  onDelete: (id: string) => void;
}

export function ProductList({ products, userId, onDelete }: ProductListProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const pending = products.filter((p) => p.status === 'pending');
  const sold = products.filter((p) => p.status === 'sold');
  const inventory = products.filter((p) => p.status === 'inventory');

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
          {product.status !== 'sold' && (
            <button
              onClick={() => setSelectedProduct(product)}
              className="p-2 rounded-xl text-sky-600 hover:bg-sky-50 transition"
              title="売却情報を入力"
            >
              <Edit className="w-5 h-5" />
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
    <div className="space-y-7">
      {section('待機中', 'bg-slate-100 text-slate-700', pending)}
      {section('在庫', 'bg-sky-100 text-sky-700', inventory)}
      {section('売却済み', 'bg-emerald-100 text-emerald-700', sold)}

      {selectedProduct && (
        <SaleForm product={selectedProduct} userId={userId} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
