import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { useApp } from '@/store/app';
import { formatDateTime, getStatusText, getDepositTypeText } from '@/utils';
import type { DepositStatus, DepositRecord } from '@/types';

const DepositPage: React.FC = () => {
  const { depositList, boxList } = useApp();
  const [searchBoxNo, setSearchBoxNo] = useState('');
  const [statusFilter, setStatusFilter] = useState<DepositStatus | 'all'>('all');

  useDidShow(() => {
    console.log('[Deposit] page did show, records:', depositList.length);
  });

  const boxNos = useMemo(() => {
    const nos = new Set<string>();
    depositList.forEach(d => nos.add(d.boxNo));
    boxList.forEach(b => nos.add(b.boxNo));
    return Array.from(nos);
  }, [depositList, boxList]);

  const summary = useMemo(() => {
    const totalAmount = depositList.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0);
    const frozenAmount = depositList.filter(d => d.status === 'frozen').reduce((sum, d) => sum + d.amount, 0);
    const unpaidCount = depositList.filter(d => d.status === 'unpaid').length;
    return { totalAmount, frozenAmount, unpaidCount };
  }, [depositList]);

  const filteredList = useMemo(() => {
    let list = [...depositList];
    if (searchBoxNo.trim()) {
      list = list.filter(d => d.boxNo.toLowerCase().includes(searchBoxNo.trim().toLowerCase()));
    }
    if (statusFilter !== 'all') {
      list = list.filter(d => d.status === statusFilter);
    }
    return list.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  }, [depositList, searchBoxNo, statusFilter]);

  const getDepositIcon = (type: string): string => {
    const map: Record<string, string> = {
      'occupy': '💰',
      'refund': '↩️',
      'freeze': '❄️',
      'unfreeze': '☀️'
    };
    return map[type] || '💳';
  };

  const handleRecordClick = (record: DepositRecord) => {
    console.log('[Deposit] click record:', record.id);
    Taro.navigateTo({ url: `/pages/box-detail/index?boxNo=${record.boxNo}` });
  };

  const statusOptions: { key: DepositStatus | 'all'; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'paid', label: '已交' },
    { key: 'unpaid', label: '未交' },
    { key: 'refunded', label: '已退' },
    { key: 'frozen', label: '已冻结' }
  ];

  return (
    <View className={styles.page}>
      <View className={styles.summaryCard}>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryLabel}>已交押金</Text>
          <Text className={classnames(styles.summaryValue, styles.summaryValuePrimary)}>
            ¥{summary.totalAmount}
          </Text>
        </View>
        <View className={styles.summaryDivider} />
        <View className={styles.summaryItem}>
          <Text className={styles.summaryLabel}>已冻结</Text>
          <Text className={classnames(styles.summaryValue, styles.summaryValueWarning)}>
            ¥{summary.frozenAmount}
          </Text>
        </View>
        <View className={styles.summaryDivider} />
        <View className={styles.summaryItem}>
          <Text className={styles.summaryLabel}>待支付</Text>
          <Text className={classnames(styles.summaryValue, styles.summaryValueError)}>
            {summary.unpaidCount} 笔
          </Text>
        </View>
      </View>

      <View className={styles.filterSection}>
        <View className={styles.searchBox}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="输入箱号搜索"
            value={searchBoxNo}
            onInput={e => setSearchBoxNo(e.detail.value)}
            clear
          />
        </View>
        <ScrollView className={styles.filterScroll} scrollX showScrollbar={false}>
          <View className={styles.filterRow}>
            {statusOptions.map(option => (
              <View
                key={option.key}
                className={classnames(
                  styles.filterChip,
                  statusFilter === option.key && styles.filterChipActive
                )}
                onClick={() => setStatusFilter(option.key)}
              >
                <Text>{option.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView className={styles.recordList} scrollY>
        {filteredList.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无押金记录</Text>
          </View>
        ) : (
          filteredList.map(record => (
            <View
              key={record.id}
              className={styles.recordCard}
              onClick={() => handleRecordClick(record)}
            >
              <View className={styles.recordHeader}>
                <View className={styles.recordLeft}>
                  <Text className={styles.recordIcon}>{getDepositIcon(record.type)}</Text>
                  <View>
                    <Text className={styles.recordTitle}>{getDepositTypeText(record.type)}</Text>
                    <Text className={styles.recordBoxNo}>箱号：{record.boxNo}</Text>
                  </View>
                </View>
                <View className={styles.recordRight}>
                  <Text
                    className={classnames(
                      styles.recordAmount,
                      record.type === 'refund' || record.type === 'unfreeze'
                        ? styles.recordAmountPositive
                        : styles.recordAmountNegative
                    )}
                  >
                    {record.type === 'refund' || record.type === 'unfreeze' ? '+' : '-'}¥{record.amount}
                  </Text>
                  <StatusTag status={record.status} text={getStatusText(record.status, 'deposit')} />
                </View>
              </View>
              <View className={styles.recordBody}>
                <Text className={styles.recordDesc}>{record.description}</Text>
                <Text className={styles.recordTime}>{formatDateTime(record.createTime)}</Text>
              </View>
            </View>
          ))
        )}
        <View className={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

export default DepositPage;
