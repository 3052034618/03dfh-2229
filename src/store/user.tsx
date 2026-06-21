import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { UserInfo } from '@/types';
import { mockUser } from '@/data/mock';

interface UserContextType {
  user: UserInfo | null;
  isLoggedIn: boolean;
  login: (type: 'phone' | 'store_code', account: string, code?: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<UserInfo>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(mockUser);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  const login = useCallback(async (type: 'phone' | 'store_code', account: string, code?: string): Promise<boolean> => {
    console.log('[Auth] login attempt', { type, account: account.substring(0, 3) + '****' });
    await new Promise(resolve => setTimeout(resolve, 800));
    if (account && (type === 'store_code' || code === '123456')) {
      setUser(mockUser);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    console.log('[Auth] logout');
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  const updateUser = useCallback((data: Partial<UserInfo>) => {
    setUser(prev => prev ? { ...prev, ...data } : prev);
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoggedIn, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
