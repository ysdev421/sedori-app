import { useState } from 'react';
import { Save, Loader, X } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useStore } from '@/lib/store';
import { calculateProfit, calculatePointProfit, formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

interface SaleFormProps {
  product: Product;
  userId: string;
  onClose?: () => void;
}

export function SaleForm({ product, userId, onClose }: SaleFormProps) {
  const [formData, setFormData] = useState({
    salePrice: product.salePrice?.toString() || '',
    saleLocation: product.saleLocation || 'メルカリ',
    saleDate: product.saleDate || new Date().toISOString().split('T')[0],
  });

  const [error, setError] = useState('');
  const { updateProductData } = useProducts(userId);
  const loading = useStore((state) => state.loading);

  const salePrice = parseFloat(formData.salePrice) || 0;
  const profit = salePrice > 0 ? calculateProfit({ ...product, salePrice }) : 0;
  const pointProfit = salePrice > 0 ? calculatePointProfit({ ...product, salePrice }) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await updateProductData(product.id, {
        salePrice: parseFloat(formData.salePrice),
        saleLocation: formData.saleLocation,
        saleDate: formData.saleDate,
        status: 'sold',
      });

      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save sale');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="w-full bg-white rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">売却情報を入力</h2>
            <p className="text-gray-600 text-sm mt-1">{product.productName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <span className="font-medium">購入価格:</span> {formatCurrency(product.purchasePrice)}
            {product.point > 0 && (
              <>
                {' '}
                <span className="font-medium">ポイント:</span> -{formatCurrency(product.point)}
              </>
            )}
          </p>
          <p className="text-sm text-gray-700 mt-1">
            <span className="font-medium">実質価格:</span>{' '}
            {formatCurrency(product.purchasePrice - product.point)}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sale Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              売却価格 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.salePrice}
                onChange={(e) =>
                  setFormData({ ...formData, salePrice: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                placeholder="0"
              />
              <span className="absolute right-4 top-2.5 text-gray-600">円</span>
            </div>
          </div>

          {/* Sale Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              売却先
            </label>
            <select
              value={formData.saleLocation}
              onChange={(e) =>
                setFormData({ ...formData, saleLocation: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
            >
              <option>メルカリ</option>
              <option>Amazon</option>
              <option>eBay</option>
              <option>買取業者</option>
              <option>その他</option>
            </select>
          </div>

          {/* Sale Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              売却日
            </label>
            <input
              type="date"
              value={formData.saleDate}
              onChange={(e) =>
                setFormData({ ...formData, saleDate: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Profit Preview */}
          {salePrice > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">利益計算</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">利益</p>
                  <p className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(profit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">P利益</p>
                  <p className={`text-lg font-bold ${pointProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(pointProfit)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {loading && <Loader className="w-5 h-5 animate-spin" />}
            <Save className="w-5 h-5" />
            売却情報を保存
          </button>
        </form>
      </div>
    </div>
  );
}
