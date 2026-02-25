import { useState } from 'react';
import { Plus } from 'lucide-react';
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24">
        <section className="mb-8">
          <Dashboard products={products} />
        </section>

        <section>
          <ProductList products={products} userId={user.id} onDelete={deleteProductData} />
        </section>

        {products.length === 0 && (
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

      {showAddForm && <AddProductForm userId={user.id} onClose={() => setShowAddForm(false)} />}
    </div>
  );
}

export default App;
