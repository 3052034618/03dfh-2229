import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import BoxCard from '@/components/BoxCard';
import { useUser } from '@/store/user';
import { useApp } from '@/store/app';
import type { BoxStatus, DepositStatus } from '@/types';

type TabType = 'in_use' | 'to_return' | 'booked_for_recycle' | 'arrived_today' | 'abnormal';
type DaysFilter = 'all' | '1-3' | '4-7' | '7+';
type DepositFilter = 'all' | DepositStatus;

const HomePage: React.FC = () => {
  const { user } = useUser();
  const { boxList } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('in_use');
  const [daysFilter, setDaysFilter] = useState<DaysFilter>('all');
  const [depositFilter, setDepositFilter] = useState<DepositFilter>('all');

  useDidShow(() => {
    console.log('[Home] page did show, box count:', boxList.length);
  });

  const stats = useMemo(() => {
    return {
      to_return: boxList.filter(b => b.status === 'to_return').length,
      in_use: boxList.filter(b => b.status === 'in_use').length,
      booked_for_recycle: boxList.filter(b => b.status === 'booked_for_recycle').length,
      arrived_today: boxList.filter(b => b.status === 'arrived_today').length,
      abnormal: boxList.filter(b => b.status === 'abnormal').length
    };
  }, [boxList]);

  const filteredList = useMemo(() => {
    let list = boxList.filter(b => b.status === activeTab);
    
    if (daysFilter !== 'all') {
      if (daysFilter === '1-3') {
        list = list.filter(b => b.borrowDays >= 1 && b.borrowDays <= 3);
      } else if (daysFilter === '4-7') {
        list = list.filter(b => b.borrowDays >= 4 && b.borrowDays <= 7);
      } else if (daysFilter === '7+') {
        list = list.filter(b => b.borrowDays > 7);
      }
    }
    
    if (depositFilter !== 'all') {
      list = list.filter(b => b.depositStatus === depositFilter);
    }
    
    return list;
  }, [boxList, activeTab, daysFilter, depositFilter]);

  const showFilters = activeTab === 'in_use' || activeTab === 'to_return' || activeTab === 'booked_for_recycle';

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    setDaysFilter('all');
    setDepositFilter('all');
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

  const handleDeposit = () => {
    Taro.navigateTo({ url: '/pages/deposit/index' });
  };

  const handleRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  };

  const getTabTitle = (tab: TabType): string => {
    const map: Record<TabType, string> = {
      to_return: '待归还',
      in_use: '使用中',
      booked_for_recycle: '已预约回收',
      arrived_today: '今日到货',
      abnormal: '异常待确认'
    };
    return map[tab];
  };

  const daysOptions: { key: DaysFilter; label: string }[] = [
    { key: 'all', label: '全部天数' },
    { key: '1-3', label: '1-3天' },
    { key: '4-7', label: '4-7天' },
    { key: '7+', label: '7天以上' }
  ];

  const depositOptions: { key: DepositFilter; label: string }[] = [
    { key: 'all', label: '全部押金' },
    { key: 'paid', label: '已交押金' },
    { key: 'unpaid', label: '未交押金' }
  ];

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
          <View className={styles.statRow}>
            <View
              className={classnames(styles.statCard, activeTab === 'in_use' && styles.statCardActive)}
              onClick={() => handleTabClick('in_use')}
            >
              <Text className={classnames(styles.statNumber, styles.statNumberPrimary)}>
                {stats.in_use}
              </Text>
              <Text className={styles.statLabel}>使用中</Text>
            </View>
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
              className={classnames(styles.statCard, activeTab === 'booked_for_recycle' && styles.statCardActive)}
              onClick={() => handleTabClick('booked_for_recycle')}
            >
              <Text className={classnames(styles.statNumber, styles.statNumberCold)}>
                {stats.booked_for_recycle}
              </Text>
              <Text className={styles.statLabel}>已预约回收</Text>
            </View>
          </View>
          <View className={styles.statRow}>
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
          <View className={styles.actionItem} onClick={handleDeposit}>
            <View className={classnames(styles.actionIcon, styles.actionIconCold)}>💰</View>
            <Text className={styles.actionText}>押金流水</Text>
          </View>
        </View>

        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>{getTabTitle(activeTab)}清单</Text>
          <Text className={styles.listCount}>共 {filteredList.length} 个</Text>
        </View>

        {showFilters && (
          <View className={styles.filterSection}>
            <ScrollView className={styles.filterScroll} scrollX showScrollbar={false}>
              <View className={styles.filterRow}>
                {daysOptions.map(option => (
                  <View
                    key={option.key}
                    className={classnames(
                      styles.filterChip,
                      daysFilter === option.key && styles.filterChipActive
                    )}
                    onClick={() => setDaysFilter(option.key)}
                  >
                    <Text>{option.label}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            <ScrollView className={styles.filterScroll} scrollX showScrollbar={false}>
              <View className={styles.filterRow}>
                {depositOptions.map(option => (
                  <View
                    key={option.key}
                    className={classnames(
                      styles.filterChip,
                      depositFilter === option.key && styles.filterChipActive
                    )}
                    onClick={() => setDepositFilter(option.key)}
                  >
                    <Text>{option.label}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

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
