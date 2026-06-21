import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { mockBoxList } from '@/data/mock';
import { formatDateTime, getStatusText, getDepositText } from '@/utils';
import type { BoxItem } from '@/types';

interface TimelineRecord {
  title: string;
  time: string;
  desc: string;
}

const BoxDetailPage: React.FC = () => {
  const router = useRouter();
  const [box, setBox] = useState<BoxItem | null>(null);

  useEffect(() => {
    const id = router.params.id;
    console.log('[BoxDetail] box id:', id);
    const found = mockBoxList.find(b => b.id === id);
    if (found) {
      setBox(found);
    } else {
      setBox(mockBoxList[0]);
    }
  }, [router.params.id]);

  const timeline: TimelineRecord[] = box ? [
    {
      title: '送到门店',
      time: box.borrowTime,
      desc: `已送达 ${box.latestLocation || '门店'}`
    },
    {
      title: '开始配送',
      time: '2024-06-15 08:00',
      desc: '承运员李师傅已取件，正在配送中'
    },
    {
      title: '出库完成',
      time: '2024-06-14 18:00',
      desc: '箱体已从冷链中心出库'
    }
  ] : [];

  const handleRecycle = () => {
    Taro.switchTab({ url: '/pages/recycle/index' });
  };

  const handleDispute = () => {
    Taro.navigateTo({ url: `/pages/dispute/index?boxNo=${box?.boxNo || ''}` });
  };

  if (!box) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const isOverdue = box.borrowDays > 5;

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <View className={styles.infoCard}>
          <View className={styles.boxHeader}>
            <View>
              <Text className={styles.boxNo}>{box.boxNo}</Text>
              <Text className={styles.boxSpecs}>{box.specs || '60L标准箱'}</Text>
            </View>
            <StatusTag status={box.status} text={getStatusText(box.status)} />
          </View>

          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>借用天数</Text>
              <Text
                className={classnames(
                  styles.infoValue,
                  styles.infoValueHighlight,
                  isOverdue && styles.warningText
                )}
              >
                {box.borrowDays} 天
              </Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>当前温度</Text>
              <Text className={styles.tempValue}>
                {box.temperature !== undefined ? `${box.temperature}℃` : '--'}
              </Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>押金状态</Text>
              <Text
                className={classnames(
                  styles.infoValue,
                  box.depositStatus === 'paid' ? styles.depositPaid : styles.depositUnpaid
                )}
              >
                {getDepositText(box.depositStatus)}
              </Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>押金金额</Text>
              <Text className={styles.infoValue}>¥{box.depositAmount}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>建议归还时间</Text>
              <Text
                className={classnames(
                  styles.infoValue,
                  isOverdue && styles.errorText
                )}
              >
                {box.suggestedReturnTime}
              </Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>当前位置</Text>
              <Text className={styles.infoValue}>
                {box.latestLocation || '--'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>流转记录</Text>
        <View className={styles.infoCard}>
          <View className={styles.timeline}>
            {timeline.map((item, index) => (
              <View key={index} className={styles.timelineItem}>
                <View
                  className={classnames(
                    styles.timelineDot,
                    index === 0 && styles.timelineDotFirst
                  )}
                />
                <View className={styles.timelineContent}>
                  <Text className={styles.timelineTitle}>{item.title}</Text>
                  <Text className={styles.timelineTime}>{item.time}</Text>
                  <Text className={styles.timelineDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.actionBar}>
        <View className={styles.secondaryBtn} onClick={handleDispute}>
          <Text>争议反馈</Text>
        </View>
        <View className={styles.primaryBtn} onClick={handleRecycle}>
          <Text>预约回收</Text>
        </View>
      </View>
    </View>
  );
};

export default BoxDetailPage;
