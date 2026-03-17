import { useMemo, useState } from 'react';
import { CheckSquare, Loader2 } from 'lucide-react';
import { confirmSaleBatchInFirestore } from '@/lib/firestore';
import { useStore } from '@/lib/store';
import { formatCurrency, getActualPayment, getEffectiveCost } from '@/lib/utils';
import type { Product } from '@/types';

interface SaleBatchManagerProps {
  products: Product[];
  userId: string;
}

export function SaleBatchManager({ products, userId }: SaleBatchManagerProps) {
  const [query, setQuery] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [saleLocation, setSaleLocation] = useState('買取店');
  const [receivedCash, setReceivedCash] = useState('');
  const [receivedPoint, setReceivedPoint] = useState('');
  const [pointRate, setPointRate] = useState('1');
  const [memo, setMemo] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const updateProduct = useStore((state) => state.updateProduct);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => p.status !== 'sold' && (p.quantityAvailable ?? p.quantityTotal ?? 1) > 0)
      .filter((p) => {
        if (!q) return true;
        const text = [p.productName, p.purchaseLocation, p.janCode || ''].join(' ').toLowerCase();
        return text.includes(q);
      });
  }, [products, query]);

  const selectedProducts = useMemo(
    () => candidates.filter((p) => selectedIds.includes(p.id)),
    [candidates, selectedIds]
  );

  const selectedEffectiveCost = selectedProducts.reduce((sum, p) => sum + getEffectiveCost(p), 0);
  const selectedActualCost = selectedProducts.reduce((sum, p) => sum + getActualPayment(p), 0);
  const receivedCashValue = Math.max(0, Math.round(parseFloat(receivedCash) || 0));
  const receivedPointValue = Math.max(0, Math.round(parseFloat(receivedPoint) || 0));
  const pointRateValue = Math.max(0, parseFloat(pointRate) || 1);
  const revenue = receivedCashValue + Math.round(receivedPointValue * pointRateValue);
  const profit = revenue - selectedEffectiveCost;
  const pointProfit = revenue - selectedActualCost;

  const allSelected = candidates.length > 0 && candidates.every((p) => selectedIds.includes(p.id));

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(candidates.map((p) => p.id));
  };

  const submit = async () => {
    setError('');
    setMessage('');
    if (selectedIds.length === 0) {
      setError('売却対象の商品を選択してください');
      return;
    }
    if (!saleLocation.trim()) {
      setError('売却先を入力してください');
      return;
    }

    setSubmitting(true);
    try {
      const result = await confirmSaleBatchInFirestore({
        userId,
        productIds: selectedIds,
        saleDate,
        saleLocation: saleLocation.trim(),
        receivedCash: receivedCashValue,
        receivedPoint: receivedPointValue,
        pointRate: pointRateValue,
        memo: memo.trim(),
      });

      result.updatedProducts.forEach((p) => {
        updateProduct(p.id, p);
      });
      setSelectedIds([]);
      setReceivedCash('');
      setReceivedPoint('');
      setMemo('');
      setMessage(`一括売却を保存しました（${result.updatedProducts.length}件）`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '一括売却の保存に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-panel p-4 space-y-3">
        <h2 className="text-lg font-bold text-slate-900">一括売却登録</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div>
            <label className="block text-xs text-slate-600 mb-1">売却日</label>
            <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">売却先</label>
            <input value={saleLocation} onChange={(e) => setSaleLocation(e.target.value)} className="input-field" placeholder="買取店名" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">受取現金</label>
            <input type="number" min={0} value={receivedCash} onChange={(e) => setReceivedCash(e.target.value)} className="input-field" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">受取ポイント</label>
            <input type="number" min={0} value={receivedPoint} onChange={(e) => setReceivedPoint(e.target.value)} className="input-field" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">ポイント換算(円)</label>
            <input type="number" min={0} step="0.01" value={pointRate} onChange={(e) => setPointRate(e.target.value)} className="input-field" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs text-slate-600 mb-1">メモ</label>
            <input value={memo} onChange={(e) => setMemo(e.target.value)} className="input-field" placeholder="任意" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/70 p-3 text-sm">
          <p className="text-slate-700">選択件数: <span className="font-semibold">{selectedProducts.length}件</span></p>
          <p className="text-slate-700">受取合計: <span className="font-semibold">{formatCurrency(revenue)}</span></p>
          <p className="text-slate-700">利益: <span className={`font-semibold ${profit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{formatCurrency(profit)}</span></p>
          <p className="text-slate-700">P利益: <span className={`font-semibold ${pointProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{formatCurrency(pointProfit)}</span></p>
          <p className="text-xs text-slate-500 mt-1">受取合計 = 現金 + (ポイント × 換算レート)</p>
        </div>

        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
        {message && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div>}

        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="btn-primary w-full inline-flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
          一括売却を確定
        </button>
      </div>

      <div className="glass-panel p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field flex-1 min-w-[220px]"
            placeholder="商品名 / JAN / 購入場所で検索"
          />
          <button type="button" onClick={toggleAll} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition">
            {allSelected ? '全解除' : '全選択'}
          </button>
        </div>

        <div className="space-y-2 max-h-[52vh] overflow-auto pr-1">
          {candidates.length === 0 ? (
            <p className="text-sm text-slate-500">売却対象の商品がありません</p>
          ) : (
            candidates.map((p) => {
              const checked = selectedIds.includes(p.id);
              const qty = p.quantityAvailable ?? p.quantityTotal ?? 1;
              return (
                <label key={p.id} className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer ${checked ? 'border-sky-300 bg-sky-50/60' : 'border-slate-200 bg-white/70'}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggleOne(p.id)} className="mt-1 h-4 w-4 accent-sky-600" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">{p.productName}</p>
                    <p className="text-xs text-slate-500">{p.purchaseLocation} / 数量 {qty}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      実質原価 {formatCurrency(getEffectiveCost(p))} ・ 購入合計 {formatCurrency(getActualPayment(p))}
                    </p>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
