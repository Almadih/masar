'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { getStoredUser, saveStoredUser } from '../utils/storage';
import { DEFAULT_GENERIC_AVATAR } from '../utils/constants';
import { authClient } from '@/lib/auth-client';
import { isUserAdmin } from '@/lib/admin';

interface AuthContextType {
  user: User | null;
  loginAsGuest: (customName?: string) => Promise<void>;
  loginWithGoogleBetterAuth: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isPending: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(true);

  // Initial load: restore stored user & sync with Better Auth session on client mount
  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
    }

    async function checkBetterAuthSession() {
      try {
        const res = await authClient.getSession();
        if (res?.data?.user) {
          const bUser = res.data.user as any;
          const isAnon = Boolean(bUser.isAnonymous);
          const isAdmin = !isAnon && isUserAdmin(bUser);
          const role = isAdmin ? 'ADMIN' : 'USER';

          const appUser: User = {
            id: bUser.id,
            name: bUser.name || (isAnon ? 'Sudanese Voyager (Guest)' : 'Sudanese Citizen'),
            email: bUser.email,
            avatar: bUser.image || DEFAULT_GENERIC_AVATAR,
            isGuest: isAnon,
            isAnonymous: isAnon,
            role,
            isAdmin: role === 'ADMIN',
          };
          setUser(appUser);
          saveStoredUser(appUser);
        } else {
          // If no active session in Better Auth, clear stale stored session
          setUser(null);
          saveStoredUser(null);
        }
      } catch (err) {
        console.warn('Better Auth session check error:', err);
      } finally {
        setIsPending(false);
      }
    }

    checkBetterAuthSession();
  }, []);

  const loginAsGuest = async (customName?: string) => {
    setIsPending(true);
    try {
      const res = await authClient.signIn.anonymous();
      if (res?.error) {
        console.error('Better Auth Anonymous Sign In error:', res.error);
      }

      // If a custom display name is provided, update user profile in Better Auth
      const trimmedName = customName?.trim();
      if (trimmedName) {
        try {
          await authClient.updateUser({ name: trimmedName });
        } catch (e) {
          console.warn('Could not update anonymous user name:', e);
        }
      }

      // Fetch fresh session to ensure complete session & cookie synchronization
      const sessionRes = await authClient.getSession();
      const bUser = (sessionRes?.data?.user || res?.data?.user) as any;

      if (bUser) {
        const appUser: User = {
          id: bUser.id,
          name: trimmedName || bUser.name || 'Sudanese Voyager (Guest)',
          email: bUser.email || 'guest@masar-sudan.org',
          avatar: bUser.image || DEFAULT_GENERIC_AVATAR,
          isGuest: true,
          isAnonymous: true,
          role: 'USER',
          isAdmin: false,
        };
        setUser(appUser);
        saveStoredUser(appUser);
      }
    } catch (error) {
      console.error('Error during guest login via Better Auth:', error);
    } finally {
      setIsPending(false);
      setIsAuthModalOpen(false);
    }
  };

  const loginWithGoogleBetterAuth = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      });
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error('Better Auth Google Sign In error:', error);
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setUser(null);
    saveStoredUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAsGuest,
        loginWithGoogleBetterAuth,
        logout,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
