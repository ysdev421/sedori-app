import { useState } from 'react';
import { BarChart3, List, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useStore } from '@/lib/store';
import { LoginForm } from '@/components/LoginForm';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { ProductList } from '@/components/ProductList';
import { AddProductForm } from '@/components/AddProductForm';

function App() {
  const { authLoading } = useAuth();
  const user = useStore((state) => state.user);
  const { products, deleteProductData } = useProducts(user?.id || null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [screen, setScreen] = useState<'summary' | 'list'>('summary');
  const [channelFilter, setChannelFilter] = useState<'all' | 'ebay' | 'kaitori'>('all');

  const filteredProducts =
    channelFilter === 'all'
      ? products
      : channelFilter === 'ebay'
      ? products.filter((p) => p.channel === 'ebay' || !p.channel)
      : products.filter((p) => p.channel === channelFilter);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-panel p-8 text-center w-full max-w-sm">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-soft">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen">
      <Header userName={user.displayName || user.email} products={products} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28">
        <section className="mb-6">
          <div className="glass-panel p-2 inline-flex gap-1">
            <button
              onClick={() => setChannelFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                channelFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white/70'
              }`}
            >
              全体
            </button>
            <button
              onClick={() => setChannelFilter('ebay')}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                channelFilter === 'ebay' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white/70'
              }`}
            >
              eBay
            </button>
            <button
              onClick={() => setChannelFilter('kaitori')}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                channelFilter === 'kaitori' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white/70'
              }`}
            >
              買取流し
            </button>
          </div>
        </section>

        {screen === 'summary' ? (
          <section>
            <Dashboard products={filteredProducts} />
          </section>
        ) : (
          <section>
            <ProductList products={filteredProducts} userId={user.id} onDelete={deleteProductData} />
          </section>
        )}

        {filteredProducts.length === 0 && (
          <div className="glass-panel text-center py-10 mt-8">
            <p className="text-lg font-semibold text-slate-800">まだ商品データがありません</p>
            <p className="text-soft text-sm mt-2">右下のボタンから最初の商品を登録してください</p>
          </div>
        )}
      </main>

      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 text-white rounded-2xl p-4 shadow-2xl transition hover:scale-105 active:scale-95 flex items-center justify-center"
        title="商品を追加"
      >
        <Plus className="w-7 h-7" />
      </button>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="glass-panel p-1.5 flex items-center gap-1">
          <button
            onClick={() => setScreen('summary')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition ${
              screen === 'summary' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white/70'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            サマリー
          </button>
          <button
            onClick={() => setScreen('list')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition ${
              screen === 'list' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white/70'
            }`}
          >
            <List className="w-4 h-4" />
            一覧
          </button>
        </div>
      </nav>

      {showAddForm && <AddProductForm userId={user.id} onClose={() => setShowAddForm(false)} />}
    </div>
  );
}

export default App;
