import React, { useState, useEffect, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useApp } from '@/store/app';
import { formatDateTime, getStatusText } from '@/utils';
import type { BookingRecord } from '@/types';

interface TimelineStep {
  title: string;
  time: string;
  done: boolean;
  current?: boolean;
}

const BookingDetailPage: React.FC = () => {
  const router = useRouter();
  const { getBookingById, bookingList } = useApp();
  const [booking, setBooking] = useState<BookingRecord | null>(null);

  useEffect(() => {
    const id = router.params.id;
    console.log('[BookingDetail] booking id:', id);
    const found = getBookingById(id || '');
    if (found) {
      console.log('[BookingDetail] found booking:', found.id, found.timeSlot, found.boxCount);
      setBooking(found);
    } else {
      console.log('[BookingDetail] booking not found, using first in list');
      setBooking(bookingList[0] || null);
    }
  }, [router.params.id, getBookingById, bookingList]);

  const getTimeline = useMemo((): TimelineStep[] => {
    if (!booking) return [];

    const steps: TimelineStep[] = [
      { title: '提交预约', time: booking.createTime, done: true },
      { title: '待承运员接单', time: '', done: false },
      { title: '承运员取件', time: '', done: false },
      { title: '回收完成', time: '', done: false }
    ];

    if (booking.status === 'pending') {
      steps[1] = { ...steps[1], title: '待承运员接单', current: true };
      return steps;
    }

    if (booking.status === 'accepted') {
      steps[1] = { ...steps[1], title: '承运员已接单', done: true, time: booking.createTime };
      steps[2] = { ...steps[2], current: true };
      return steps;
    }

    if (booking.status === 'picked_up') {
      steps[1] = { ...steps[1], title: '承运员已接单', done: true, time: booking.createTime };
      steps[2] = { ...steps[2], done: true, time: booking.createTime };
      steps[3] = { ...steps[3], current: true };
      return steps;
    }

    if (booking.status === 'completed') {
      steps[1] = { ...steps[1], title: '承运员已接单' };
      return steps.map(s => ({ ...s, done: true, time: s.time || booking.createTime }));
    }

    return steps;
  }, [booking]);

  const getStatusIcon = (): string => {
    if (!booking) return '📦';
    const iconMap: Record<string, string> = {
      'pending': '⏳',
      'accepted': '🚚',
      'picked_up': '✅',
      'completed': '🎉',
      'cancelled': '❌'
    };
    return iconMap[booking.status] || '📦';
  };

  const handleCallCarrier = () => {
    if (!booking?.carrierPhone) return;
    Taro.makePhoneCall({
      phoneNumber: booking.carrierPhone
    });
  };

  const handleCancel = () => {
    Taro.showModal({
      title: '取消预约',
      content: '确定要取消这次回收预约吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已取消', icon: 'success' });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1000);
        }
      }
    });
  };

  if (!booking) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const timeline = getTimeline();
  const canCancel = booking.status === 'pending' || booking.status === 'accepted';

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <View className={styles.statusCard}>
          <View className={styles.statusTop}>
            <View>
              <Text className={styles.statusText}>{getStatusText(booking.status)}</Text>
              <View className={styles.statusDesc}>
                {booking.status === 'pending' && '已提交预约，请耐心等待承运员接单'}
                {booking.status === 'accepted' && `承运员已接单，预计 ${booking.estimatedArrivalTime || '14:30'} 到达`}
                {booking.status === 'picked_up' && '承运员已取件，正在运回'}
                {booking.status === 'completed' && '本次回收已完成'}
                {booking.status === 'cancelled' && '预约已取消'}
              </View>
            </View>
            <Text className={styles.statusIcon}>{getStatusIcon()}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.infoCard}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>预约时间</Text>
            <Text className={classnames(styles.infoValue, styles.infoValueHighlight)}>
              {booking.timeSlot}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>回收箱数</Text>
            <Text className={styles.infoValue}>{booking.boxCount} 个</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>取件地址</Text>
            <Text className={styles.infoValue}>{booking.address}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>提交时间</Text>
            <Text className={styles.infoValue}>{formatDateTime(booking.createTime)}</Text>
          </View>
          {booking.boxNos && booking.boxNos.length > 0 && (
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>箱子列表</Text>
              <View className={styles.boxList}>
                {booking.boxNos.map(boxNo => (
                  <Text key={boxNo} className={styles.boxTag}>{boxNo}</Text>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      {(booking.carrierName || booking.status === 'accepted' || booking.status === 'picked_up') && (
        <View className={styles.section}>
          <View className={styles.carrierCard}>
            <Text className={styles.carrierTitle}>承运员信息</Text>
            <View className={styles.carrierInfo}>
              <View className={styles.carrierAvatar}>
                <Text>👨‍🔧</Text>
              </View>
              <View className={styles.carrierDetail}>
                <Text className={styles.carrierName}>{booking.carrierName || '张师傅'}</Text>
                <Text className={styles.carrierPhone}>
                  {booking.carrierPhone || '139****9000'}
                </Text>
              </View>
              <View className={styles.callBtn} onClick={handleCallCarrier}>
                <Text>📞</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>进度跟踪</Text>
        <View className={styles.infoCard}>
          <View className={styles.timeline}>
            {timeline.map((step, index) => (
              <View key={index} className={styles.timelineItem}>
                <View
                  className={classnames(
                    styles.timelineDot,
                    (step.done || step.current) && styles.timelineDotActive
                  )}
                />
                <View className={styles.timelineContent}>
                  <Text
                    className={classnames(
                      styles.timelineTitle,
                      step.current && styles.timelineTitleActive
                    )}
                  >
                    {step.title}
                    {step.current && '（进行中）'}
                  </Text>
                  {step.time && (
                    <Text className={styles.timelineTime}>{formatDateTime(step.time)}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {canCancel && (
        <View className={styles.actionBar}>
          <View className={styles.secondaryBtn} onClick={handleCancel}>
            <Text>取消预约</Text>
          </View>
          <View className={styles.primaryBtn} onClick={handleCallCarrier}>
            <Text>联系承运员</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default BookingDetailPage;
