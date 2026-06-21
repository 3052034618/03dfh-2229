import React, { useEffect, useContext } from 'react';
import Taro, { useDidShow, useDidHide, useRouter } from '@tarojs/taro';
import { UserProvider, useUser } from './store/user';
import { AppProvider } from './store/app';
import './app.scss';

const AuthChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useUser();
  const router = useRouter();

  useDidShow(() => {
    const currentPath = router.path;
    console.log('[Auth] page show:', currentPath, 'loggedIn:', isLoggedIn);

    const publicPages = ['pages/login/index'];
    const isPublicPage = publicPages.some(p => currentPath.includes(p));

    if (!isLoggedIn && !isPublicPage) {
      console.log('[Auth] redirect to login');
      Taro.reLaunch({ url: '/pages/login/index' });
    }
  });

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
