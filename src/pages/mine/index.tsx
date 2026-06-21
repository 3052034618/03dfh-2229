import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useUser } from '@/store/user';
import { maskPhone } from '@/utils';

interface MenuItemConfig {
  icon: string;
  text: string;
  badge?: string;
  action: () => void;
}

const MinePage: React.FC = () => {
  const { user, logout } = useUser();

  const menuGroups: MenuItemConfig[][] = [
    [
      {
        icon: '💬',
        text: '争议反馈',
        badge: '2',
        action: () => {
          Taro.navigateTo({ url: '/pages/dispute/index' });
        }
      },
      {
        icon: '💰',
        text: '押金流水',
        action: () => {
          Taro.navigateTo({ url: '/pages/deposit/index' });
        }
      },
      {
        icon: '📋',
        text: '借用记录',
        action: () => {
          Taro.showToast({ title: '功能开发中', icon: 'none' });
        }
      }
    ],
    [
      {
        icon: '❓',
        text: '使用帮助',
        action: () => {
          Taro.showToast({ title: '功能开发中', icon: 'none' });
        }
      },
      {
        icon: '📞',
        text: '联系客服',
        action: () => {
          Taro.showModal({
            title: '联系客服',
            content: '客服热线：400-888-8888\n工作时间：9:00-21:00',
            showCancel: false,
            confirmText: '我知道了'
          });
        }
      },
      {
        icon: 'ℹ️',
        text: '关于我们',
        action: () => {
          Taro.showToast({ title: '功能开发中', icon: 'none' });
        }
      }
    ]
  ];

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          logout();
          Taro.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>
            <Text>👤</Text>
          </View>
          <View className={styles.userText}>
            <Text className={styles.userName}>{user?.name || '未登录'}</Text>
            <Text className={styles.storeName}>{user?.storeName || '--'}</Text>
            <Text className={styles.storeCode}>
              门店码：{user?.storeCode || '--'} | {maskPhone(user?.phone || '')}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>¥{user?.deposit || 0}</Text>
          <Text className={styles.statLabel}>押金总额</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{user?.totalBoxes || 0}</Text>
          <Text className={styles.statLabel}>在箱数量</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>28</Text>
          <Text className={styles.statLabel}>历史借用</Text>
        </View>
      </View>

      {menuGroups.map((group, groupIndex) => (
        <View key={groupIndex} className={styles.menuSection}>
          {group.map((item, index) => (
            <View key={index} className={styles.menuItem} onClick={item.action}>
              <View className={styles.menuIcon}>
                <Text>{item.icon}</Text>
              </View>
              <Text className={styles.menuText}>{item.text}</Text>
              {item.badge && <Text className={styles.menuBadge}>{item.badge}</Text>}
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      ))}

      <View className={styles.logoutSection}>
        <View className={styles.logoutBtn} onClick={handleLogout}>
          <Text>退出登录</Text>
        </View>
      </View>
    </View>
  );
};

export default MinePage;
