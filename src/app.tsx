import React, { useEffect } from 'react';
import Taro, { useDidShow, useDidHide, useRouter } from '@tarojs/taro';
import { UserProvider, useUser } from './store/user';
import { AppProvider } from './store/app';
import './app.scss';

const AuthChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, isLoading } = useUser();
  const router = useRouter();

  const checkAuth = () => {
    if (isLoading) return;

    const currentPath = router.path;
    console.log('[Auth] check auth:', currentPath, 'loggedIn:', isLoggedIn);

    const publicPages = ['pages/login/index'];
    const isPublicPage = publicPages.some(p => currentPath.includes(p));

    if (!isLoggedIn && !isPublicPage) {
      console.log('[Auth] not logged in, redirect to login');
      Taro.reLaunch({ url: '/pages/login/index' });
      return;
    }

    if (isLoggedIn && isPublicPage) {
      console.log('[Auth] already logged in, redirect to home');
      Taro.switchTab({ url: '/pages/home/index' });
    }
  };

  useEffect(() => {
    checkAuth();
  }, [isLoggedIn, isLoading, router.path]);

  useDidShow(() => {
    checkAuth();
  });

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
};

function App(props) {
  useEffect(() => {
    console.log('[App] initialized');
  }, []);

  useDidShow(() => {
    console.log('[App] did show');
  });

  useDidHide(() => {
    console.log('[App] did hide');
  });

  return (
    <UserProvider>
      <AppProvider>
        <AuthChecker>
          {props.children}
        </AuthChecker>
      </AppProvider>
    </UserProvider>
  );
}

export default App;
