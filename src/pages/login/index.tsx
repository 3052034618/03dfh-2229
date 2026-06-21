import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useUser } from '@/store/user';
import type { LoginType } from '@/types';

const LoginPage: React.FC = () => {
  const { login } = useUser();
  const [loginType, setLoginType] = useState<LoginType>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [storeCode, setStoreCode] = useState('');
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  const canLogin = () => {
    if (loginType === 'phone') {
      return phone.length === 11 && code.length === 6;
    }
    return storeCode.length >= 4;
  };

  const handleSendCode = () => {
    if (phone.length !== 11) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    if (codeCountdown > 0) return;

    console.log('[Login] send code to', phone.substring(0, 3) + '****');
    Taro.showToast({ title: '验证码已发送', icon: 'success' });
    setCodeCountdown(60);

    const timer = setInterval(() => {
      setCodeCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async () => {
    if (!canLogin() || loading) return;

    setLoading(true);
    console.log('[Login] attempt login', { type: loginType });

    try {
      const account = loginType === 'phone' ? phone : storeCode;
      const success = await login(loginType, account, code);

      if (success) {
        Taro.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/home/index' });
        }, 1000);
      } else {
        Taro.showToast({
          title: loginType === 'phone' ? '验证码错误（提示：123456）' : '门店码不存在',
          icon: 'none'
        });
      }
    } catch (err) {
      console.error('[Login] login error:', err);
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.logoSection}>
        <Text className={styles.logoIcon}>🧊</Text>
        <Text className={styles.appName}>低温箱管家</Text>
        <Text className={styles.appDesc}>冷链周转箱自助管理平台</Text>
      </View>

      <View className={styles.tabSection}>
        <View
          className={classnames(
            styles.tabItem,
            loginType === 'phone' && styles.tabItemActive
          )}
          onClick={() => setLoginType('phone')}
        >
          <Text>手机号登录</Text>
        </View>
        <View
          className={classnames(
            styles.tabItem,
            loginType === 'store_code' && styles.tabItemActive
          )}
          onClick={() => setLoginType('store_code')}
        >
          <Text>门店码登录</Text>
        </View>
      </View>

      <View className={styles.formCard}>
        {loginType === 'phone' ? (
          <>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>手机号</Text>
              <Input
                className={styles.inputBox}
                type="number"
                maxlength={11}
                placeholder="请输入手机号"
                value={phone}
                onInput={(e) => setPhone(e.detail.value)}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>验证码</Text>
              <View className={styles.codeRow}>
                <Input
                  className={classnames(styles.inputBox, styles.codeInput)}
                  type="number"
                  maxlength={6}
                  placeholder="请输入验证码"
                  value={code}
                  onInput={(e) => setCode(e.detail.value)}
                />
                <View
                  className={classnames(
                    styles.codeBtn,
                    codeCountdown > 0 && styles.codeBtnDisabled
                  )}
                  onClick={handleSendCode}
                >
                  <Text>
                    {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>门店码</Text>
            <Input
              className={styles.inputBox}
              placeholder="请输入门店码"
              value={storeCode}
              onInput={(e) => setStoreCode(e.detail.value)}
            />
          </View>
        )}

        <View
          className={classnames(
            styles.loginBtn,
            !canLogin() && styles.loginBtnDisabled
          )}
          onClick={handleLogin}
        >
          <Text>{loading ? '登录中...' : '登录'}</Text>
        </View>

        <Text className={styles.tipText}>
          登录即表示同意
          <Text className={styles.highlight}>《用户协议》</Text>
          和
          <Text className={styles.highlight}>《隐私政策》</Text>
        </Text>
      </View>
    </View>
  );
};

export default LoginPage;
