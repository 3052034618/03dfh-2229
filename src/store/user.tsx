import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import Taro from '@tarojs/taro';
import type { UserInfo } from '@/types';
import { mockUser } from '@/data/mock';

const USER_STORAGE_KEY = 'cold_chain_user_info';

interface UserContextType {
  user: UserInfo | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (type: 'phone' | 'store_code', account: string, code?: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<UserInfo>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await Taro.getStorage({ key: USER_STORAGE_KEY });
        if (res.data) {
          const savedUser = JSON.parse(res.data);
          setUser(savedUser);
          setIsLoggedIn(true);
          console.log('[Auth] user loaded from storage');
        }
      } catch (err) {
        console.log('[Auth] no saved user');
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = useCallback(async (type: 'phone' | 'store_code', account: string, code?: string): Promise<boolean> => {
    console.log('[Auth] login attempt', { type, account: account.substring(0, 3) + '****' });
    await new Promise(resolve => setTimeout(resolve, 800));
    if (account && (type === 'store_code' || code === '123456')) {
      const userData = { ...mockUser };
      if (type === 'phone') {
        userData.phone = account;
      } else if (type === 'store_code') {
        userData.storeCode = account;
      }
      setUser(userData);
      setIsLoggedIn(true);
      try {
        await Taro.setStorage({ key: USER_STORAGE_KEY, data: JSON.stringify(userData) });
      } catch (err) {
        console.error('[Auth] save user error:', err);
      }
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    console.log('[Auth] logout');
    setUser(null);
    setIsLoggedIn(false);
    Taro.removeStorage({ key: USER_STORAGE_KEY }).catch(() => {});
    Taro.reLaunch({ url: '/pages/login/index' });
  }, []);

  const updateUser = useCallback(async (data: Partial<UserInfo>) => {
    setUser(prev => {
      const newUser = prev ? { ...prev, ...data } : prev;
      if (newUser) {
        Taro.setStorage({ key: USER_STORAGE_KEY, data: JSON.stringify(newUser) }).catch(() => {});
      }
      return newUser;
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoggedIn, isLoading, login, logout, updateUser }}>
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
