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

  // ローディング中
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">ロード中...</p>
        </div>
      </div>
    );
  }

  // ログイン画面
  if (!user) {
    return <LoginForm />;
  }

  // メイン画面
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={user.displayName || user.email}
        products={products}
      />

      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {/* Dashboard */}
        <section className="mb-8">
          <Dashboard products={products} />
        </section>

        {/* Products List */}
        <section className="mb-8">
          <ProductList
            products={products}
            userId={user.id}
            onDelete={deleteProductData}
          />
        </section>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">まだ商品が登録されていません</p>
            <p className="text-gray-500 text-sm mt-2">
              右下の「+」ボタンから商品を追加してください
            </p>
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition transform hover:scale-110 active:scale-95 flex items-center justify-center"
        title="商品を追加"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Add Product Form */}
      {showAddForm && (
        <AddProductForm
          userId={user.id}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}

export default App;
