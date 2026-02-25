import { useState } from 'react';
import { Loader, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ChangePasswordModalProps {
  onClose: () => void;
}

export function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const { changePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('パスワードは6文字以上にしてください');
      return;
    }
    if (password !== confirmPassword) {
      setError('確認用パスワードが一致しません');
      return;
    }

    setLoading(true);
    try {
      await changePassword(password);
      setSuccess('パスワードを変更しました');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'パスワード変更に失敗しました';
      if (msg.includes('requires-recent-login')) {
        setError('安全のため再ログイン後にもう一度お試しください');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="glass-panel w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">パスワード変更</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/70">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="新しいパスワード"
            className="input-field"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="新しいパスワード（確認）"
            className="input-field"
            required
          />

          {error && <p className="text-sm text-rose-600">{error}</p>}
          {success && <p className="text-sm text-emerald-700">{success}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full inline-flex items-center justify-center gap-2">
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" />
            変更する
          </button>
        </form>
      </div>
    </div>
  );
}
