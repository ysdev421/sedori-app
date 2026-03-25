import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import {
  getSaleLocationUsageCounts,
  getUserSaleLocations,
  upsertUserSaleLocations,
} from '@/lib/firestore';

interface SaleLocationMasterProps {
  userId: string;
}

export function SaleLocationMaster({ userId }: SaleLocationMasterProps) {
  const [locations, setLocations] = useState<string[]>([]);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const [newLocation, setNewLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [draggingLocation, setDraggingLocation] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [rows, counts] = await Promise.all([
          getUserSaleLocations(userId),
          getSaleLocationUsageCounts(userId),
        ]);
        setLocations(rows);
        setUsageCounts(counts);
      } catch {
        setLocations([]);
        setUsageCounts({});
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const inUseCount = useMemo(
    () => locations.filter((name) => (usageCounts[name] || 0) > 0).length,
    [locations, usageCounts]
  );
  const visibleLocations = useMemo(
    () => locations.filter((name) => name.toLowerCase().includes(search.trim().toLowerCase())),
    [locations, search]
  );

  const addLocation = () => {
    const value = newLocation.trim();
    if (!value) return;
    if (locations.includes(value)) {
      setMessage('同じ売却先は追加できません');
      return;
    }
    setLocations((prev) => [...prev, value]);
    setNewLocation('');
    setMessage('');
  };

  const removeLocation = (name: string) => {
    if ((usageCounts[name] || 0) > 0) {
      setMessage(`「${name}」は売却履歴で使用中のため削除できません`);
      return;
    }
    setLocations((prev) => prev.filter((l) => l !== name));
    setMessage('');
  };

  const moveUp = (name: string) => {
    setLocations((prev) => {
      const idx = prev.indexOf(name);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (name: string) => {
    setLocations((prev) => {
      const idx = prev.indexOf(name);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await upsertUserSaleLocations(userId, locations);
      setMessage('保存しました');
    } catch {
      setMessage('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (name: string) => setDraggingLocation(name);
  const handleDragOver = (e: React.DragEvent, name: string) => {
    e.preventDefault();
    if (!draggingLocation || draggingLocation === name) return;
    setLocations((prev) => {
      const from = prev.indexOf(draggingLocation);
      const to = prev.indexOf(name);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, draggingLocation);
      return next;
    });
  };

  return (
    <div className="glass-panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">売却先マスタ</h2>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-primary px-3 py-1.5 text-sm inline-flex items-center gap-1"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          保存
        </button>
      </div>

      {message && (
        <p className={`text-sm px-3 py-2 rounded-lg ${message.includes('失敗') || message.includes('できません') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
          {message}
        </p>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addLocation()}
          placeholder="新しい売却先を追加"
          className="input-field flex-1"
        />
        <button type="button" onClick={addLocation} className="btn-primary px-3 py-2">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {locations.length > 5 && (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="絞り込み..."
          className="input-field w-full"
        />
      )}

      {inUseCount > 0 && (
        <p className="text-xs text-slate-500">※ 売却履歴で使用中の売却先は削除できません（{inUseCount}件）</p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" /> 読み込み中...
        </div>
      ) : (
        <div className="space-y-1.5">
          {visibleLocations.map((name) => {
            const count = usageCounts[name] || 0;
            const inUse = count > 0;
            return (
              <div
                key={name}
                draggable
                onDragStart={() => handleDragStart(name)}
                onDragOver={(e) => handleDragOver(e, name)}
                onDragEnd={() => setDraggingLocation(null)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border bg-white/80 cursor-grab active:cursor-grabbing transition ${draggingLocation === name ? 'opacity-50 border-sky-300' : 'border-slate-200'}`}
              >
                <span className="flex-1 text-sm font-medium text-slate-800 truncate">
                  {name}
                  {inUse && <span className="ml-1.5 text-xs text-slate-400">({count}件)</span>}
                </span>
                <button type="button" onClick={() => moveUp(name)} className="p-1 rounded hover:bg-slate-100">
                  <ArrowUp className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <button type="button" onClick={() => moveDown(name)} className="p-1 rounded hover:bg-slate-100">
                  <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <button
                  type="button"
                  onClick={() => removeLocation(name)}
                  disabled={inUse}
                  className={`p-1 rounded transition ${inUse ? 'opacity-30 cursor-not-allowed' : 'hover:bg-rose-50 text-rose-500'}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
          {visibleLocations.length === 0 && (
            <p className="text-sm text-slate-500">売却先がありません</p>
          )}
        </div>
      )}
    </div>
  );
}
