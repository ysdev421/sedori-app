import { create } from 'zustand';
import type { Product, User } from '@/types';

interface AppStore {
  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setProducts: (products: Product[]) => void;

  // UI
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  success: string | null;
  setSuccess: (success: string | null) => void;
}

export const useStore = create<AppStore>((set) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),

  // Products
  products: [],
  addProduct: (product) =>
    set((state) => ({
      products: [product, ...state.products],
    })),
  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
  setProducts: (products) => set({ products }),

  // UI
  loading: false,
  setLoading: (loading) => set({ loading }),
  error: null,
  setError: (error) => set({ error }),
  success: null,
  setSuccess: (success) => set({ success }),
}));
