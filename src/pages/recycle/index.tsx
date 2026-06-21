import React, { useState, useMemo } from 'react';
import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { useUser } from '@/store/user';
import { useApp } from '@/store/app';
import { mockTimeSlots } from '@/data/mock';
import { formatDateTime, getStatusText, generateId, getDepositText } from '@/utils';
import type { BoxItem, BookingRecord } from '@/types';

const RecyclePage: React.FC = () => {
  const { user } = useUser();
  const { boxList, bookingList, addBooking, getBookingById } = useApp();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedBoxIds, setSelectedBoxIds] = useState<string[]>([]);
  const [address, setAddress] = useState(user?.storeName ? `${user.storeName}（门店自取）` : '');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastBookingId, setLastBookingId] = useState<string>('');

  const selectableBoxes = useMemo(() => {
    return boxList.filter(b => b.status === 'in_use' || b.status === 'to_return');
  }, [boxList]);

  useDidShow(() => {
    console.log('[Recycle] page did show, selectable boxes:', selectableBoxes.length);
  });

  const canSubmit = () => {
    return selectedTime && selectedBoxIds.length > 0 && address.trim();
  };

  const handleBoxSelect = (box: BoxItem) => {
    setSelectedBoxIds(prev => {
      if (prev.includes(box.id)) {
        return prev.filter(id => id !== box.id);
      }
      return [...prev, box.id];
    });
  };

  const handleSelectAll = () => {
    if (selectedBoxIds.length === selectableBoxes.length && selectableBoxes.length > 0) {
      setSelectedBoxIds([]);
    } else {
      setSelectedBoxIds(selectableBoxes.map(b => b.id));
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleSubmit = async () => {
    if (!canSubmit() || submitting) return;

    setSubmitting(true);
    console.log('[Recycle] submit booking', {
      time: selectedTime,
      selectedBoxIds,
      address
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const selectedBoxes = selectableBoxes.filter(b => selectedBoxIds.includes(b.id));
      const boxNos = selectedBoxes.map(b => b.boxNo);
      const newId = generateId();
      const newBooking: BookingRecord = {
        id: newId,
        boxCount: selectedBoxIds.length,
        timeSlot: selectedTime,
        address,
        status: 'pending',
        createTime: new Date().toISOString(),
        boxNos
      };

      addBooking(newBooking, selectedBoxIds);
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
    setSelectedBoxIds([]);
  };

  const handleViewDetail = () => {
    if (lastBookingId) {
      setShowSuccess(false);
      setSelectedTime('');
      setSelectedBoxIds([]);
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
            <Text className={styles.tipDesc}>选择需要回收的箱子，提交预约后承运员上门取件</Text>
          </View>
          <Text className={styles.tipNum}>{selectableBoxes.length}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.formCard}>
          <View className={styles.formHeaderRow}>
            <Text className={styles.formTitle}>选择回收箱</Text>
            <Text
              className={styles.selectAllText}
              onClick={handleSelectAll}
            >
              {selectedBoxIds.length === selectableBoxes.length && selectableBoxes.length > 0
                ? '取消全选'
                : '全选'}
            </Text>
          </View>

          <View className={styles.boxCountInfo}>
            <Text className={styles.boxCountLabel}>已选</Text>
            <Text className={styles.boxCountValue}>
              <Text className={styles.boxCountHighlight}>{selectedBoxIds.length}</Text> / 共 {selectableBoxes.length} 个
            </Text>
          </View>

          <View className={styles.boxSelector}>
            {selectableBoxes.length === 0 ? (
              <View className={styles.emptySelector}>
                <Text className={styles.emptyText}>暂无可回收的箱子</Text>
              </View>
            ) : (
              selectableBoxes.map(box => (
                <View
                  key={box.id}
                  className={classnames(
                    styles.boxSelectItem,
                    selectedBoxIds.includes(box.id) && styles.boxSelectItemActive
                  )}
                  onClick={() => handleBoxSelect(box)}
                >
                  <View className={styles.boxSelectCheckbox}>
                    {selectedBoxIds.includes(box.id) && (
                      <Text className={styles.checkIcon}>✓</Text>
                    )}
                  </View>
                  <View className={styles.boxSelectInfo}>
                    <View className={styles.boxSelectHeader}>
                      <Text className={styles.boxSelectNo}>{box.boxNo}</Text>
                      <StatusTag status={box.status} text={getStatusText(box.status)} />
                    </View>
                    <View className={styles.boxSelectMeta}>
                      <Text className={styles.boxMetaItem}>借用 {box.borrowDays} 天</Text>
                      <Text className={styles.boxMetaItem}>押金 ¥{box.depositAmount}</Text>
                      <Text
                        className={classnames(
                          styles.boxMetaItem,
                          box.depositStatus === 'paid' ? styles.depositPaid : styles.depositUnpaid
                        )}
                      >
                        {getDepositText(box.depositStatus)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

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
            {record.boxNos && record.boxNos.length > 0 && (
              <View className={styles.recordBoxNos}>
                <Text className={styles.recordBoxNosLabel}>箱子：</Text>
                <Text className={styles.recordBoxNosValue}>{record.boxNos.join('、')}</Text>
              </View>
            )}
            <View className={styles.recordAddress}>
              <Text>{record.address}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.submitBar}>
        <View className={styles.submitBarInfo}>
          <Text className={styles.submitBarLabel}>已选</Text>
          <Text className={styles.submitBarCount}>
            <Text className={styles.submitBarCountHighlight}>{selectedBoxIds.length}</Text> 个
          </Text>
        </View>
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
              已预约 {selectedBoxIds.length} 个箱子回收{'\n'}
              承运员将尽快接单，请保持电话畅通
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
