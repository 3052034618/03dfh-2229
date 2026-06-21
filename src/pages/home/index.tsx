import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import BoxCard from '@/components/BoxCard';
import { useUser } from '@/store/user';
import { mockBoxList } from '@/data/mock';
import { maskPhone } from '@/utils';
import type { BoxStatus } from '@/types';

type TabType = 'all' | 'to_return' | 'arrived_today' | 'abnormal';

const HomePage: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('to_return');
  const [boxList, setBoxList] = useState(mockBoxList);

  useDidShow(() => {
    console.log('[Home] page did show');
  });

  const stats = useMemo(() => {
    return {
      to_return: boxList.filter(b => b.status === 'to_return').length,
      arrived_today: boxList.filter(b => b.status === 'arrived_today').length,
      abnormal: boxList.filter(b => b.status === 'abnormal').length
    };
  }, [boxList]);

  const filteredList = useMemo(() => {
    if (activeTab === 'all') return boxList;
    return boxList.filter(b => b.status === activeTab);
  }, [boxList, activeTab]);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleScan = () => {
    Taro.switchTab({ url: '/pages/scan/index' });
  };

  const handleRecycle = () => {
    Taro.switchTab({ url: '/pages/recycle/index' });
  };

  const handleDispute = () => {
    Taro.navigateTo({ url: '/pages/dispute/index' });
  };

  const handleRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  };

  const getTabTitle = (tab: TabType): string => {
    const map: Record<TabType, string> = {
      all: '全部',
      to_return: '待归还',
      arrived_today: '今日到货',
      abnormal: '异常'
    };
    return map[tab];
  };

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.header}>
        <Text className={styles.storeName}>{user?.storeName || '加载中...'}</Text>
        <Text className={styles.storeCode}>门店码：{user?.storeCode || '--'}</Text>
        <View className={styles.depositRow}>
          <View className={styles.depositItem}>
            <Text className={styles.depositLabel}>押金总额</Text>
            <Text className={styles.depositValue}>¥{user?.deposit || 0}</Text>
          </View>
          <View className={styles.depositItem}>
            <Text className={styles.depositLabel}>在箱数量</Text>
            <Text className={styles.depositValue}>{user?.totalBoxes || 0}个</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.statCards}>
          <View
            className={classnames(styles.statCard, activeTab === 'to_return' && styles.statCardActive)}
            onClick={() => handleTabClick('to_return')}
          >
            <Text className={classnames(styles.statNumber, styles.statNumberWarning)}>
              {stats.to_return}
            </Text>
            <Text className={styles.statLabel}>待归还箱</Text>
          </View>
          <View
            className={classnames(styles.statCard, activeTab === 'arrived_today' && styles.statCardActive)}
            onClick={() => handleTabClick('arrived_today')}
          >
            <Text className={classnames(styles.statNumber, styles.statNumberInfo)}>
              {stats.arrived_today}
            </Text>
            <Text className={styles.statLabel}>今日到货</Text>
          </View>
          <View
            className={classnames(styles.statCard, activeTab === 'abnormal' && styles.statCardActive)}
            onClick={() => handleTabClick('abnormal')}
          >
            <Text className={classnames(styles.statNumber, styles.statNumberError)}>
              {stats.abnormal}
            </Text>
            <Text className={styles.statLabel}>异常待确认</Text>
          </View>
        </View>

        <View className={styles.quickActions}>
          <View className={styles.actionItem} onClick={handleScan}>
            <View className={styles.actionIcon}>📱</View>
            <Text className={styles.actionText}>扫码到货</Text>
          </View>
          <View className={styles.actionItem} onClick={handleRecycle}>
            <View className={classnames(styles.actionIcon, styles.actionIconOrange)}>🚚</View>
            <Text className={styles.actionText}>预约回收</Text>
          </View>
          <View className={styles.actionItem} onClick={handleDispute}>
            <View className={classnames(styles.actionIcon, styles.actionIconGreen)}>💬</View>
            <Text className={styles.actionText}>争议反馈</Text>
          </View>
        </View>

        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>{getTabTitle(activeTab)}清单</Text>
          <Text className={styles.listCount}>共 {filteredList.length} 个</Text>
        </View>

        <View className={styles.boxList}>
          {filteredList.map(box => (
            <BoxCard key={box.id} box={box} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
