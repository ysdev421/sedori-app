import { useState } from 'react';
import { Plus, Loader, X } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useStore } from '@/lib/store';

interface AddProductFormProps {
  userId: string;
  onClose?: () => void;
}

export function AddProductForm({ userId, onClose }: AddProductFormProps) {
  const [formData, setFormData] = useState({
    productName: '',
    purchasePrice: '',
    point: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseLocation: 'メルカリ',
  });

  const [error, setError] = useState('');
  const { createProduct } = useProducts(userId);
  const loading = useStore((state) => state.loading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await createProduct({
        productName: formData.productName,
        purchasePrice: parseFloat(formData.purchasePrice),
        point: parseFloat(formData.point) || 0,
        purchaseDate: formData.purchaseDate,
        purchaseLocation: formData.purchaseLocation,
        status: 'pending',
      });

      // フォームをリセット
      setFormData({
        productName: '',
        purchasePrice: '',
        point: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseLocation: 'メルカリ',
      });

      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="w-full bg-white rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">商品を追加</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              商品名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) =>
                setFormData({ ...formData, productName: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
              placeholder="例: ポッチャマAR 送料"
            />
          </div>

          {/* Purchase Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              購入価格 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                placeholder="0"
              />
              <span className="absolute right-4 top-2.5 text-gray-600">円</span>
            </div>
          </div>

          {/* Point */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ポイント/優待値引き
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.point}
                onChange={(e) => setFormData({ ...formData, point: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                placeholder="0"
              />
              <span className="absolute right-4 top-2.5 text-gray-600">円</span>
            </div>
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              購入日
            </label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) =>
                setFormData({ ...formData, purchaseDate: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Purchase Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              購入場所
            </label>
            <select
              value={formData.purchaseLocation}
              onChange={(e) =>
                setFormData({ ...formData, purchaseLocation: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
            >
              <option>メルカリ</option>
              <option>Amazon</option>
              <option>楽天</option>
              <option>ポケモンセンター</option>
              <option>店舗</option>
              <option>その他</option>
            </select>
          </div>

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
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {loading && <Loader className="w-5 h-5 animate-spin" />}
            <Plus className="w-5 h-5" />
            商品を追加
          </button>
        </form>
      </div>
    </div>
  );
}
