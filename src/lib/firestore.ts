import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Product, SaleRecord } from '@/types';

export async function addProductToFirestore(
  userId: string,
  productData: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'products'), {
    ...productData,
    userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return docRef.id;
}

export async function updateProductInFirestore(
  productId: string,
  updates: Partial<Product>
): Promise<void> {
  const productRef = doc(db, 'products', productId);
  await updateDoc(productRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  await deleteDoc(doc(db, 'products', productId));
}

export async function getUserProducts(userId: string): Promise<Product[]> {
  const q = query(collection(db, 'products'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((snapshot: any) => ({
    id: snapshot.id,
    ...(snapshot.data() as Omit<Product, 'id'>),
  }));
}

export async function addSaleRecord(
  userId: string,
  saleData: Omit<SaleRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'sales'), {
    ...saleData,
    userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return docRef.id;
}

export async function getUserSalesRecords(userId: string): Promise<SaleRecord[]> {
  const q = query(collection(db, 'sales'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((snapshot: any) => ({
    id: snapshot.id,
    ...(snapshot.data() as Omit<SaleRecord, 'id'>),
  }));
}
