import { useState } from 'react';
import { Loader, Plus, X } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useStore } from '@/lib/store';

interface AddProductFormProps {
  userId: string;
  onClose?: () => void;
}

export function AddProductForm({ userId, onClose }: AddProductFormProps) {
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '1',
    purchasePrice: '',
    point: '',
    channel: 'ebay' as 'ebay' | 'kaitori',
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
      const qty = Math.max(1, parseInt(formData.quantity, 10) || 1);
      await createProduct({
        productName: formData.productName,
        quantityTotal: qty,
        quantityAvailable: qty,
        channel: formData.channel,
        purchasePrice: parseFloat(formData.purchasePrice),
        point: parseFloat(formData.point) || 0,
        purchaseDate: formData.purchaseDate,
        purchaseLocation: formData.purchaseLocation,
        status: 'pending',
      });

      setFormData({
        productName: '',
        quantity: '1',
        purchasePrice: '',
        point: '',
        channel: 'ebay',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseLocation: 'メルカリ',
      });
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full bg-white rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">商品を追加</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">商品名 *</label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              required
              className="input-field"
              placeholder="例: チェキフィルム"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">数量 *</label>
              <input
                type="number"
                min={1}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                className="input-field"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">購入価格 *</label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                required
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ポイント</label>
            <input
              type="number"
              value={formData.point}
              onChange={(e) => setFormData({ ...formData, point: e.target.value })}
              className="input-field"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">販路</label>
            <select
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value as 'ebay' | 'kaitori' })}
              className="input-field"
            >
              <option value="ebay">eBay</option>
              <option value="kaitori">買取流し</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">購入日</label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">購入場所</label>
            <input
              type="text"
              value={formData.purchaseLocation}
              onChange={(e) => setFormData({ ...formData, purchaseLocation: e.target.value })}
              className="input-field"
              placeholder="メルカリ"
            />
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-6 py-3">
            {loading && <Loader className="w-5 h-5 animate-spin" />}
            <Plus className="w-5 h-5" />
            商品を追加
          </button>
        </form>
      </div>
    </div>
  );
}
