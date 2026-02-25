import { useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useStore } from '@/lib/store';
import type { User } from '@/types';

export function useAuth() {
  const [authLoading, setAuthLoading] = useState(true);
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: any) => {
      if (firebaseUser) {
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          createdAt: new Date().toISOString(),
        };
        setUser(user);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  const login = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      await signOut(auth);
    } finally {
      setAuthLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const changePassword = async (newPassword: string) => {
    if (!auth.currentUser) {
      throw new Error('ログインが必要です');
    }
    await updatePassword(auth.currentUser, newPassword);
  };

  return {
    login,
    register,
    logout,
    resetPassword,
    changePassword,
    authLoading,
  };
}
