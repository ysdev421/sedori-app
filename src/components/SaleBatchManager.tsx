import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { Box, PlusCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import type { Product } from '@/types';

interface SaleBatchManagerProps {
  products: Product[];
  userId: string;
}

interface SaleBatch {
  id: string;
  method: 'shipping' | 'in_store';
  buyer: string;
  campaign?: string;
  shippingCost: number;
  status: 'in_progress' | 'confirmed';
  createdAt: string;
}

const getAvailableQty = (product: Product) => Math.max(1, Number((product as any).quantity || 1));

export function SaleBatchManager({ products, userId }: SaleBatchManagerProps) {
  const [method, setMethod] = useState<'shipping' | 'in_store'>('shipping');
  const [buyer, setBuyer] = useState('');
  const [campaign, setCampaign] = useState('');
  const [shippingCost, setShippingCost] = useState('0');
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<SaleBatch[]>([]);
  const [message, setMessage] = useState('');

  const candidates = useMemo(
    () => products.filter((p) => p.status === 'pending' || p.status === 'inventory'),
    [products]
  );

  const selectedEntries = Object.entries(selected).filter(([, qty]) => qty > 0);

  const loadBatches = async () => {
    const q = query(collection(db, 'sale_batches'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const rows = snap.docs.map((d: any) => {
      const data: any = d.data();
      return {
        id: d.id,
        method: data.method,
        buyer: data.buyer,
        campaign: data.campaign,
        shippingCost: Number(data.shippingCost || 0),
        status: data.status,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      } as SaleBatch;
    });
    setBatches(rows);
  };

  useEffect(() => {
    loadBatches().catch(() => undefined);
  }, [userId]);

  const handleSelect = (productId: string, checked: boolean) => {
    if (!checked) {
      const next = { ...selected };
      delete next[productId];
      setSelected(next);
      return;
    }
    setSelected((prev) => ({ ...prev, [productId]: 1 }));
  };

  const handleCreateBatch = async () => {
    setMessage('');
    if (!buyer.trim()) {
      setMessage('買取先を入力してください');
      return;
    }
    if (selectedEntries.length === 0) {
      setMessage('売却に入れる商品を選択してください');
      return;
    }

    setLoading(true);
    try {
      const batchRef = await addDoc(collection(db, 'sale_batches'), {
        userId,
        method,
        buyer: buyer.trim(),
        campaign: campaign.trim(),
        shippingCost: Number(shippingCost || 0),
        status: 'in_progress',
        itemCount: selectedEntries.length,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      const now = Timestamp.now();
      for (const [productId, qty] of selectedEntries) {
        const product = candidates.find((p) => p.id === productId);
        if (!product) continue;

        await addDoc(collection(db, 'sale_batch_items'), {
          batchId: batchRef.id,
          userId,
          productId,
          productName: product.productName,
          quantity: qty,
          purchasePrice: product.purchasePrice,
          point: product.point,
          status: 'in_progress',
          createdAt: now,
          updatedAt: now,
        });
      }

      setBuyer('');
      setCampaign('');
      setShippingCost('0');
      setSelected({});
      setMessage('売却バッチを作成しました');
      await loadBatches();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '売却バッチ作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-panel p-4 space-y-3">
        <h3 className="font-bold text-slate-900 inline-flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-sky-600" />
          まとめて売却を作成
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={method} onChange={(e) => setMethod(e.target.value as any)} className="input-field">
            <option value="shipping">郵送</option>
            <option value="in_store">来店</option>
          </select>
          <input value={buyer} onChange={(e) => setBuyer(e.target.value)} className="input-field" placeholder="買取先（例: 買取Wiki）" />
          <input value={campaign} onChange={(e) => setCampaign(e.target.value)} className="input-field" placeholder="キャンペーン（任意）" />
          <input type="number" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} className="input-field" placeholder="送料" />
        </div>

        <div className="max-h-64 overflow-auto border border-slate-200 rounded-xl p-2 space-y-2 bg-white/60">
          {candidates.map((p) => {
            const checked = selected[p.id] !== undefined;
            const maxQty = getAvailableQty(p);
            return (
              <label key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/70">
                <input type="checkbox" checked={checked} onChange={(e) => handleSelect(p.id, e.target.checked)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{p.productName}</p>
                  <p className="text-xs text-slate-500">在庫可能数: {maxQty}</p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={maxQty}
                  disabled={!checked}
                  value={selected[p.id] || 1}
                  onChange={(e) =>
                    setSelected((prev) => ({ ...prev, [p.id]: Math.max(1, Math.min(maxQty, Number(e.target.value || 1))) }))
                  }
                  className="w-20 px-2 py-1 border rounded-lg"
                />
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">選択: {selectedEntries.length}件</p>
          <button
            onClick={handleCreateBatch}
            disabled={loading}
            className="btn-primary px-4 py-2 rounded-xl text-sm"
          >
            {loading ? '作成中...' : '売却バッチを作成'}
          </button>
        </div>

        {message && <p className="text-sm text-slate-700">{message}</p>}
      </div>

      <div className="glass-panel p-4">
        <h3 className="font-bold text-slate-900 inline-flex items-center gap-2 mb-3">
          <Box className="w-5 h-5 text-indigo-600" />
          最近の売却バッチ
        </h3>

        <div className="space-y-2">
          {batches.length === 0 && <p className="text-sm text-slate-500">まだ売却バッチはありません</p>}
          {batches.map((b) => (
            <div key={b.id} className="border border-slate-200 rounded-xl p-3 bg-white/60">
              <p className="text-sm font-semibold">{b.buyer}</p>
              <p className="text-xs text-slate-500">
                {b.method === 'shipping' ? '郵送' : '来店'} / 送料 {b.shippingCost} 円 / {new Date(b.createdAt).toLocaleDateString('ja-JP')}
              </p>
              {b.campaign && <p className="text-xs text-indigo-600 mt-1">{b.campaign}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
