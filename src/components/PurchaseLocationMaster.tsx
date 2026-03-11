import { useEffect, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { getUserPurchaseLocations, upsertUserPurchaseLocations } from '@/lib/firestore';

interface PurchaseLocationMasterProps {
  userId: string;
}

export function PurchaseLocationMaster({ userId }: PurchaseLocationMasterProps) {
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const rows = await getUserPurchaseLocations(userId);
        setLocations(rows);
      } catch {
        setLocations(['メルカリ']);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const addLocation = () => {
    const value = newLocation.trim();
    if (!value) return;
    if (locations.includes(value)) {
      setMessage('同じ購入場所は追加できません');
      return;
    }
    setLocations((prev) => [...prev, value]);
    setNewLocation('');
    setMessage('');
  };

  const removeLocation = (target: string) => {
    setLocations((prev) => prev.filter((v) => v !== target));
  };

  const saveLocations = async () => {
    setSaving(true);
    setMessage('');
    try {
      await upsertUserPurchaseLocations(userId, locations);
      const rows = await getUserPurchaseLocations(userId);
      setLocations(rows);
      setMessage('購入場所マスタを保存しました');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="glass-panel p-6 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-600" />
        <p className="text-sm text-slate-600 mt-2">購入場所マスタを読み込み中...</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="glass-panel p-5">
        <h2 className="text-lg font-bold text-slate-900">購入場所マスタ管理</h2>
        <p className="text-sm text-slate-600 mt-1">商品追加時の購入場所候補を管理します。</p>

        <div className="mt-4 flex gap-2">
          <input
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLocation();
              }
            }}
            className="input-field"
            placeholder="例: ハードオフ"
          />
          <button onClick={addLocation} type="button" className="px-4 py-2 rounded-xl bg-slate-900 text-white inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            追加
          </button>
        </div>
      </div>

      <div className="glass-panel p-5 space-y-2">
        {locations.length === 0 ? (
          <p className="text-sm text-slate-500">候補がありません。1件以上追加してください。</p>
        ) : (
          locations.map((location) => (
            <div key={location} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2 bg-white/60">
              <span className="text-sm text-slate-800">{location}</span>
              <button
                type="button"
                onClick={() => removeLocation(location)}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                title="削除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {message && <p className="text-sm text-slate-700">{message}</p>}

      <button
        type="button"
        onClick={saveLocations}
        disabled={saving}
        className="btn-primary px-4 py-2 rounded-xl inline-flex items-center gap-2"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        <Save className="w-4 h-4" />
        保存
      </button>
    </section>
  );
}
