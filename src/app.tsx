import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { UserProvider } from './store/user';
import './app.scss';

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
      {props.children}
    </UserProvider>
  );
}

export default App;
