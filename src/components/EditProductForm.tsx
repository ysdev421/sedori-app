import { useState } from 'react';
import { Loader, Save, X } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useStore } from '@/lib/store';
import type { Product } from '@/types';

interface EditProductFormProps {
  product: Product;
  userId: string;
  onClose?: () => void;
}

export function EditProductForm({ product, userId, onClose }: EditProductFormProps) {
  const { updateProductData } = useProducts(userId);
  const loading = useStore((state) => state.loading);

  const [formData, setFormData] = useState({
    productName: product.productName,
    purchasePrice: String(product.purchasePrice),
    point: String(product.point),
    purchaseDate: product.purchaseDate,
    purchaseLocation: product.purchaseLocation,
    status: product.status,
    salePrice: product.salePrice ? String(product.salePrice) : '',
    saleLocation: product.saleLocation || '',
    saleDate: product.saleDate || '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const updates: Partial<Product> = {
        productName: formData.productName,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        point: parseFloat(formData.point) || 0,
        purchaseDate: formData.purchaseDate,
        purchaseLocation: formData.purchaseLocation,
        status: formData.status,
      };

      if (formData.status === 'sold') {
        updates.salePrice = parseFloat(formData.salePrice) || 0;
        updates.saleLocation = formData.saleLocation || '未設定';
        updates.saleDate = formData.saleDate || new Date().toISOString().split('T')[0];
      } else {
        updates.salePrice = undefined;
        updates.saleLocation = undefined;
        updates.saleDate = undefined;
      }

      await updateProductData(product.id, updates);
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/45 flex items-end z-50">
      <div className="w-full bg-white rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto animate-slide-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900">商品を編集</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">商品名</label>
            <input
              type="text"
              required
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">購入価格</label>
              <input
                type="number"
                required
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">ポイント</label>
              <input
                type="number"
                value={formData.point}
                onChange={(e) => setFormData({ ...formData, point: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">購入日</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">ステータス</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Product['status'] })}
                className="input-field"
              >
                <option value="pending">待機中</option>
                <option value="inventory">在庫</option>
                <option value="sold">売却済み</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">購入場所</label>
            <input
              type="text"
              value={formData.purchaseLocation}
              onChange={(e) => setFormData({ ...formData, purchaseLocation: e.target.value })}
              className="input-field"
            />
          </div>

          {formData.status === 'sold' && (
            <div className="glass-panel p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-800">売却情報</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">売却価格</label>
                  <input
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">売却日</label>
                  <input
                    type="date"
                    value={formData.saleDate}
                    onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">売却先</label>
                <input
                  type="text"
                  value={formData.saleLocation}
                  onChange={(e) => setFormData({ ...formData, saleLocation: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          )}

          {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary w-full inline-flex items-center justify-center gap-2 mt-2">
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" />
            保存
          </button>
        </form>
      </div>
    </div>
  );
}
