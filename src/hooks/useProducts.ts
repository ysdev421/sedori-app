import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import {
  addProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  getUserProducts,
} from '@/lib/firestore';
import type { Product } from '@/types';

export function useProducts(userId: string | null) {
  const { products, setProducts, addProduct, updateProduct, deleteProduct } = useStore();
  const setLoading = useStore((state) => state.setLoading);
  const setError = useStore((state) => state.setError);

  // ユーザーの商品を読み込む
  useEffect(() => {
    if (!userId) return;

    const loadProducts = async () => {
      setLoading(true);
      try {
        const userProducts = await getUserProducts(userId);
        setProducts(userProducts);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [userId, setProducts, setLoading, setError]);

  const createProduct = async (
    productData: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!userId) throw new Error('User not authenticated');

    setLoading(true);
    try {
      const id = await addProductToFirestore(userId, productData);
      const newProduct: Product = {
        ...productData,
        id,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addProduct(newProduct);
      setError(null);
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create product';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProductData = async (id: string, updates: Partial<Product>) => {
    setLoading(true);
    try {
      await updateProductInFirestore(id, updates);
      updateProduct(id, updates);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProductData = async (id: string) => {
    setLoading(true);
    try {
      await deleteProductFromFirestore(id);
      deleteProduct(id);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    createProduct,
    updateProductData,
    deleteProductData,
  };
}
