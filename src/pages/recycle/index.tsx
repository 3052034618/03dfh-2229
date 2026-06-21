import React, { useState } from 'react';
import { View, Text, Textarea } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { useUser } from '@/store/user';
import { useApp } from '@/store/app';
import { mockTimeSlots } from '@/data/mock';
import { formatDateTime, getStatusText, generateId } from '@/utils';
import type { BookingRecord } from '@/types';

const RecyclePage: React.FC = () => {
  const { user } = useUser();
  const { boxList, bookingList, addBooking, getBookingById } = useApp();
  const [selectedTime, setSelectedTime] = useState('');
  const [boxCount, setBoxCount] = useState(1);
  const [address, setAddress] = useState(user?.storeName ? `${user.storeName}（门店自取）` : '');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastBookingId, setLastBookingId] = useState<string>('');

  useDidShow(() => {
    console.log('[Recycle] page did show, booking count:', bookingList.length);
  });

  const returnableCount = boxList.filter(
    b => b.status === 'to_return' || b.status === 'in_use'
  ).length;

  const canSubmit = () => {
    return selectedTime && boxCount > 0 && address.trim();
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleCountChange = (delta: number) => {
    const newCount = boxCount + delta;
    if (newCount >= 1 && newCount <= returnableCount) {
      setBoxCount(newCount);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit() || submitting) return;

    setSubmitting(true);
    console.log('[Recycle] submit booking', {
      time: selectedTime,
      boxCount,
      address
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newId = generateId();
      const newBooking: BookingRecord = {
        id: newId,
        boxCount,
        timeSlot: selectedTime,
        address,
        status: 'pending',
        createTime: new Date().toISOString()
      };

      addBooking(newBooking);
      setLastBookingId(newId);
      setShowSuccess(true);
    } catch (err) {
      console.error('[Recycle] submit error:', err);
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setSelectedTime('');
    setBoxCount(1);
  };

  const handleViewDetail = () => {
    if (lastBookingId) {
      setShowSuccess(false);
      setSelectedTime('');
      setBoxCount(1);
      Taro.navigateTo({
        url: `/pages/booking-detail/index?id=${lastBookingId}`
      });
    }
  };

  const handleRecordClick = (record: BookingRecord) => {
    console.log('[Recycle] click record:', record.id, record.timeSlot, record.boxCount);
    Taro.navigateTo({
      url: `/pages/booking-detail/index?id=${record.id}`
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <View className={styles.tipCard}>
          <Text className={styles.tipIcon}>📦</Text>
          <View className={styles.tipContent}>
            <Text className={styles.tipTitle}>可回收箱子</Text>
            <Text className={styles.tipDesc}>提交预约后，承运员将上门取件</Text>
          </View>
          <Text className={styles.tipNum}>{returnableCount}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.formCard}>
          <Text className={styles.formTitle}>预约信息</Text>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>取件时间段</Text>
            <View className={styles.timeSlots}>
              {mockTimeSlots.map(time => (
                <View
                  key={time}
                  className={classnames(
                    styles.timeSlot,
                    selectedTime === time && styles.timeSlotActive
                  )}
                  onClick={() => handleTimeSelect(time)}
                >
                  <Text>{time}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <View className={styles.boxCountRow}>
              <Text className={styles.boxCountLabel}>回收箱数</Text>
              <View className={styles.stepper}>
                <View
                  className={classnames(
                    styles.stepperBtn,
                    boxCount <= 1 && styles.stepperBtnDisabled
                  )}
                  onClick={() => handleCountChange(-1)}
                >
                  <Text>-</Text>
                </View>
                <Text className={styles.stepperValue}>{boxCount}</Text>
                <View
                  className={classnames(
                    styles.stepperBtn,
                    boxCount >= returnableCount && styles.stepperBtnDisabled
                  )}
                  onClick={() => handleCountChange(1)}
                >
                  <Text>+</Text>
                </View>
              </View>
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>取件地址</Text>
            <Textarea
              className={styles.addressInput}
              placeholder="请输入详细取件地址"
              value={address}
              onInput={(e) => setAddress(e.detail.value)}
              maxlength={100}
            />
          </View>
        </View>
      </View>

      <View className={styles.recordsSection}>
        <View className={styles.recordsHeader}>
          <Text className={styles.recordsTitle}>预约记录</Text>
        </View>

        {bookingList.map(record => (
          <View
            key={record.id}
            className={styles.recordCard}
            onClick={() => handleRecordClick(record)}
          >
            <View className={styles.recordHeader}>
              <StatusTag status={record.status} text={getStatusText(record.status)} />
              <Text className={styles.recordTime}>{formatDateTime(record.createTime)}</Text>
            </View>
            <View className={styles.recordBody}>
              <View className={styles.recordInfoItem}>
                <Text className={styles.recordInfoLabel}>箱数</Text>
                <Text className={styles.recordInfoValue}>{record.boxCount} 个</Text>
              </View>
              <View className={styles.recordInfoItem}>
                <Text className={styles.recordInfoLabel}>时间段</Text>
                <Text className={styles.recordInfoValue}>{record.timeSlot}</Text>
              </View>
            </View>
            <View className={styles.recordAddress}>
              <Text>{record.address}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.submitBar}>
        <View
          className={classnames(
            styles.submitBtn,
            !canSubmit() && styles.submitBtnDisabled
          )}
          onClick={handleSubmit}
        >
          <Text>{submitting ? '提交中...' : '提交预约'}</Text>
        </View>
      </View>

      {showSuccess && (
        <View className={styles.successModal} onClick={handleSuccessClose}>
          <View className={styles.successCard} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.successIcon}>✅</Text>
            <Text className={styles.successTitle}>预约提交成功</Text>
            <Text className={styles.successDesc}>
              承运员将尽快接单{'\n'}
              请保持电话畅通
            </Text>
            <View className={styles.successBtnRow}>
              <View className={styles.successBtnSecondary} onClick={handleSuccessClose}>
                <Text>我知道了</Text>
              </View>
              <View className={styles.successBtnPrimary} onClick={handleViewDetail}>
                <Text>查看详情</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default RecyclePage;
