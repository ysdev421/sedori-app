import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { SaleForm } from './SaleForm';
import { calculateProfit, calculatePointProfit, formatCurrency, formatDate } from '@/lib/utils';
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

  const renderProductCard = (product: Product) => (
    <div
      key={product.id}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition animate-fade-in"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {product.productName}
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {formatDate(product.purchaseDate)} {product.purchaseLocation}
          </p>

          {/* Price Info */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-gray-600">購入価格</p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(product.purchasePrice)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">ポイント</p>
              <p className="font-semibold text-gray-900">
                -{formatCurrency(product.point)}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-3">
            {product.status === 'sold' ? (
              <div className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded">
                売却済
              </div>
            ) : product.status === 'inventory' ? (
              <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">
                在庫
              </div>
            ) : (
              <div className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded">
                待機中
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {product.status !== 'sold' && (
            <button
              onClick={() => setSelectedProduct(product)}
              className="p-2 hover:bg-sky-50 rounded-lg text-sky-600 transition"
              title="売却情報を入力"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => onDelete(product.id)}
            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
            title="削除"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sold Info */}
      {product.status === 'sold' && product.salePrice && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-600">売却価格</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(product.salePrice)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">利益</p>
            <p className={`font-semibold ${calculateProfit(product) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(calculateProfit(product))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">P利益</p>
            <p className={`font-semibold ${calculatePointProfit(product) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(calculatePointProfit(product))}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 待機中 */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
              待機中 {pending.length}
            </span>
          </h2>
          <div className="space-y-3">
            {pending.map(renderProductCard)}
          </div>
        </div>
      )}

      {/* 在庫 */}
      {inventory.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              在庫 {inventory.length}
            </span>
          </h2>
          <div className="space-y-3">
            {inventory.map(renderProductCard)}
          </div>
        </div>
      )}

      {/* 売却済 */}
      {sold.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              売却済 {sold.length}
            </span>
          </h2>
          <div className="space-y-3">
            {sold.map(renderProductCard)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">商品がありません</p>
          <p className="text-gray-500 text-sm mt-2">
            まず商品を追加してください
          </p>
        </div>
      )}

      {/* Sale Form Modal */}
      {selectedProduct && (
        <SaleForm
          product={selectedProduct}
          userId={userId}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
