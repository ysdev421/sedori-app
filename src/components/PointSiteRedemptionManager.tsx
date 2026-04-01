import { useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { NumericInput } from '@/components/NumericInput';
import { RichDatePicker } from '@/components/RichDatePicker';
import { addPointSiteRedemption, deletePointSiteRedemption, getUserPointSiteRedemptions, updatePointSiteRedemption } from '@/lib/firestore';
import type { PointSiteRedemption } from '@/types';

const SITE_SUGGESTIONS = ['モッピー', 'ハピタス', 'Powl', 'ポイントインカム', 'その他'];

interface PointSiteRedemptionManagerProps {
  userId: string;
}

function emptyForm() {
  return {
    siteName: '',
    amount: '',
    redeemedAt: new Date().toISOString().split('T')[0],
    memo: '',
  };
}

export function PointSiteRedemptionManager({ userId }: PointSiteRedemptionManagerProps) {
  const [records, setRecords] = useState<PointSiteRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PointSiteRedemption | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setRecords(await getUserPointSiteRedemptions(userId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [userId]);

  const openAdd = () => {
    setEditingRecord(null);
    setForm(emptyForm());
    setError('');
    setShowForm(true);
  };

  const openEdit = (r: PointSiteRedemption) => {
    setEditingRecord(r);
    setForm({ siteName: r.siteName, amount: String(r.amount), redeemedAt: r.redeemedAt, memo: r.memo || '' });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const amount = parseFloat(form.amount) || 0;
    if (!form.siteName.trim()) { setError('サイト名を入力してください'); return; }
    if (amount <= 0) { setError('還元額を入力してください'); return; }
    setSaving(true);
    try {
      if (editingRecord) {
        await updatePointSiteRedemption(editingRecord.id, {
          siteName: form.siteName.trim(),
          amount,
          redeemedAt: form.redeemedAt,
          memo: form.memo.trim() || undefined,
        });
      } else {
        await addPointSiteRedemption(userId, {
          siteName: form.siteName.trim(),
          amount,
          redeemedAt: form.redeemedAt,
          memo: form.memo.trim() || undefined,
        });
      }
      setShowForm(false);
      setEditingRecord(null);
      await load();
    } catch {
      setError('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deletePointSiteRedemption(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const totalAmount = records.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-800">ポイントサイト還元管理</h2>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md hover:opacity-90 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          追加
        </button>
      </div>

      {showForm && (
        <div className="glass-panel p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">{editingRecord ? '還元を編集' : '還元を記録'}</h3>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded-lg">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  サイト名 <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white">必須</span>
                </label>
                <input
                  type="text"
                  value={form.siteName}
                  onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                  list="site-suggestions"
                  className="input-field"
                  placeholder="モッピー・ハピタス等"
                />
                <datalist id="site-suggestions">
                  {SITE_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  還元額（円） <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white">必須</span>
                </label>
                <NumericInput
                  integer
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="input-field"
                  placeholder="1000"
                />
              </div>
            </div>
            <RichDatePicker
              label="還元日"
              value={form.redeemedAt}
              onChange={(v) => setForm({ ...form, redeemedAt: v })}
            />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">メモ</label>
              <input
                type="text"
                value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
                className="input-field"
                placeholder="任意"
              />
            </div>
            {error && <p className="text-xs text-rose-600">{error}</p>}
            <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin inline-block mr-1" /> : null}
              {saving ? '保存中...' : editingRecord ? '更新する' : '記録する'}
            </button>
          </form>
        </div>
      )}

      {!loading && records.length > 0 && (
        <div className="glass-panel p-3 flex items-center justify-between">
          <span className="text-sm text-slate-600">還元合計</span>
          <span className="text-base font-black text-emerald-600">+{totalAmount.toLocaleString('ja-JP')}円</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : records.length === 0 ? (
        <div className="glass-panel text-center py-8">
          <p className="text-sm text-slate-500">還元記録がありません</p>
          <p className="text-xs text-slate-400 mt-1">追加ボタンから記録してください</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r.id} className="glass-panel px-3 py-2.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">{r.siteName}</span>
                  {r.memo && <span className="text-[11px] text-slate-400 truncate">{r.memo}</span>}
                </div>
                <span className="text-xs text-slate-400">{r.redeemedAt}</span>
              </div>
              <span className="text-sm font-bold text-emerald-600 shrink-0">+{r.amount.toLocaleString()}円</span>
              <button
                onClick={() => openEdit(r)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 transition shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                disabled={deletingId === r.id}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-rose-400 hover:bg-rose-50 transition shrink-0"
              >
                {deletingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
