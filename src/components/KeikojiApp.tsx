import { Smartphone } from 'lucide-react';

interface KeikojiAppProps {
  userId: string;
}

export function KeikojiApp({ userId: _userId }: KeikojiAppProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
        <Smartphone className="w-10 h-10 text-violet-500" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">ケーコジ管理</h2>
        <p className="text-sm text-slate-500 max-w-xs">
          回線・CB・端末の管理機能を準備中です。
        </p>
      </div>
      <div className="glass-panel p-4 text-left w-full max-w-xs space-y-2">
        <p className="text-xs font-semibold text-slate-600 mb-2">実装予定の機能</p>
        {[
          '回線一覧（キャリア・契約日・解約推奨日）',
          'CB管理（種別・金額・受取期限）',
          '端末管理（機種・購入価格・売却）',
          '回線別損益サマリー',
        ].map((item) => (
          <div key={item} className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">・</span>
            <span className="text-xs text-slate-600">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
