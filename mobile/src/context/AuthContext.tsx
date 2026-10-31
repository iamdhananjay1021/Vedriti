import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, FamilyMemberInput, onUnauthorized, ProfileUpdate } from '../services/api';
import { session } from '../services/session';
import type { AuthResult, UserProfile } from '../types/api';

type AuthStatus = 'loading' | 'offline' | 'signedOut' | 'signedIn';

interface AuthContextType {
  status: AuthStatus;
  user: UserProfile | null;
  retry: () => Promise<void>;
  completeLogin: (result: AuthResult) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<UserProfile>;
  uploadAvatar: (blob: Blob) => Promise<void>;
  removeAvatar: () => Promise<void>;
  addFamilyMember: (member: FamilyMemberInput) => Promise<void>;
  updateFamilyMember: (id: string, member: FamilyMemberInput) => Promise<void>;
  removeFamilyMember: (id: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<UserProfile | null>(null);

  const signOutLocally = useCallback(async () => {
    await session.clear();
    setUser(null);
    setStatus('signedOut');
  }, []);

  useEffect(() => {
    onUnauthorized(() => {
      signOutLocally();
    });
    return () => onUnauthorized(null);
  }, [signOutLocally]);

  const boot = useCallback(async () => {
    setStatus('loading');
    const token = await session.load();
    if (!token) {
      setStatus('signedOut');
      return;
    }
    try {
      const me = await api.me();
      setUser(me);
      setStatus('signedIn');
    } catch (error: any) {
      if (error?.status === 0 || error?.status >= 500) {
        setStatus('offline');
      } else {
        await signOutLocally();
      }
    }
  }, [signOutLocally]);

  useEffect(() => {
    boot();
  }, [boot]);

  const completeLogin = useCallback(async (result: AuthResult) => {
    await session.set(result.token);
    setUser(result.user);
    setStatus('signedIn');
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await api.me();
    setUser(me);
  }, []);

  const updateProfile = useCallback(async (updates: ProfileUpdate) => {
    const next = await api.updateMe(updates);
    setUser(next);
    return next;
  }, []);

  const uploadAvatar = useCallback(async (blob: Blob) => {
    setUser(await api.uploadAvatar(blob));
  }, []);

  const removeAvatar = useCallback(async () => {
    setUser(await api.removeAvatar());
  }, []);

  const addFamilyMember = useCallback(async (member: FamilyMemberInput) => {
    setUser(await api.addFamilyMember(member));
  }, []);

  const updateFamilyMember = useCallback(async (id: string, member: FamilyMemberInput) => {
    setUser(await api.updateFamilyMember(id, member));
  }, []);

  const removeFamilyMember = useCallback(async (id: string) => {
    setUser(await api.removeFamilyMember(id));
  }, []);

  const logout = useCallback(async () => {
    await signOutLocally();
  }, [signOutLocally]);

  const deleteAccount = useCallback(async () => {
    await api.deleteMe();
    await signOutLocally();
  }, [signOutLocally]);

  const value = useMemo(
    () => ({
      status,
      user,
      retry: boot,
      completeLogin,
      refreshUser,
      updateProfile,
      uploadAvatar,
      removeAvatar,
      addFamilyMember,
      updateFamilyMember,
      removeFamilyMember,
      logout,
      deleteAccount,
    }),
    [status, user, boot, completeLogin, refreshUser, updateProfile, uploadAvatar, removeAvatar, addFamilyMember, updateFamilyMember, removeFamilyMember, logout, deleteAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
