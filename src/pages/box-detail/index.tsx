import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { useApp } from '@/store/app';
import { formatDateTime, getStatusText, getDepositText } from '@/utils';
import type { BoxItem, TimelineEvent } from '@/types';

const BoxDetailPage: React.FC = () => {
  const router = useRouter();
  const { getBoxById, getBoxByNo, getTimelineForBox } = useApp();
  const [box, setBox] = useState<BoxItem | null>(null);
  const [highlightEventId, setHighlightEventId] = useState<string>('');
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    const id = router.params.id;
    const boxNo = router.params.boxNo;
    const highlightId = router.params.highlightEventId;
    console.log('[BoxDetail] params:', { id, boxNo, highlightId });
    
    let found: BoxItem | undefined;
    if (id) {
      found = getBoxById(id);
    }
    if (!found && boxNo) {
      found = getBoxByNo(boxNo);
    }
    
    if (found) {
      setBox(found);
    } else {
      console.warn('[BoxDetail] box not found');
    }

    if (highlightId) {
      setHighlightEventId(highlightId);
    }
  }, [router.params.id, router.params.boxNo, router.params.highlightEventId, getBoxById, getBoxByNo]);

  const timeline = useMemo((): TimelineEvent[] => {
    if (!box) return [];
    return getTimelineForBox(box.boxNo);
  }, [box, getTimelineForBox]);

  const getTimelineIcon = (type: string): string => {
    const map: Record<string, string> = {
      'arrival_check': '✅',
      'booking': '🚚',
      'dispute': '💬',
      'status_change': '📦',
      'deposit': '💰'
    };
    return map[type] || '📋';
  };

  const handleTimelineClick = (event: TimelineEvent) => {
    if (event.relatedType === 'booking' && event.relatedId) {
      Taro.navigateTo({ url: `/pages/booking-detail/index?id=${event.relatedId}` });
    } else if (event.relatedType === 'dispute' && event.relatedId) {
      Taro.navigateTo({ url: `/pages/dispute/index?highlightDisputeId=${event.relatedId}` });
    }
  };

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
    <ScrollView className={styles.page} scrollY scrollIntoView={highlightEventId || undefined}>
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

      {box?.arrivalCheck && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>到货检查记录</Text>
          <View className={styles.infoCard}>
            <View className={styles.checkInfoRow}>
              <Text className={styles.checkLabel}>检查时间</Text>
              <Text className={styles.checkValue}>
                {formatDateTime(box.arrivalCheck.checkTime)}
              </Text>
            </View>
            {box.arrivalCheck.items.map((item, index) => (
              <View key={index} className={styles.checkItemRow}>
                <Text className={styles.checkItemLabel}>{item.label}</Text>
                <Text
                  className={classnames(
                    styles.checkItemValue,
                    item.value === 'normal' && styles.checkNormal,
                    item.value === 'abnormal' && styles.checkAbnormal
                  )}
                >
                  {item.value === 'normal' ? '正常' : '异常'}
                </Text>
              </View>
            ))}
            {box.arrivalCheck.abnormalDesc && (
              <View className={styles.checkDescRow}>
                <Text className={styles.checkDescLabel}>异常说明</Text>
                <Text className={styles.checkDescText}>
                  {box.arrivalCheck.abnormalDesc}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>全链路追溯</Text>
        <View className={styles.infoCard}>
          <View className={styles.timeline}>
            {timeline.map((event, index) => (
              <View
                key={event.id}
                id={`event_${event.id}`}
                className={classnames(
                  styles.timelineItem,
                  event.relatedType && styles.timelineItemClickable,
                  highlightEventId === event.id && styles.timelineItemHighlight
                )}
                onClick={() => handleTimelineClick(event)}
              >
                <View
                  className={classnames(
                    styles.timelineDot,
                    index === 0 && styles.timelineDotFirst
                  )}
                >
                  <Text className={styles.timelineIcon}>{getTimelineIcon(event.type)}</Text>
                </View>
                <View className={styles.timelineContent}>
                  <View className={styles.timelineHeader}>
                    <Text className={styles.timelineTitle}>{event.title}</Text>
                    {event.status && (
                      <StatusTag
                        status={event.status}
                        text={getStatusText(event.status, event.relatedType as any)}
                        size="small"
                      />
                    )}
                  </View>
                  <Text className={styles.timelineTime}>{formatDateTime(event.time)}</Text>
                  <Text className={styles.timelineDesc}>{event.desc}</Text>
                  {event.relatedType && (
                    <Text className={styles.timelineAction}>点击查看详情 ›</Text>
                  )}
                  {event.type === 'status_change' && event.previousStatus && (
                    <Text className={styles.timelineStatusChange}>
                      {getStatusText(event.previousStatus)} → {getStatusText(event.status)}
                    </Text>
                  )}
                  {event.type === 'deposit' && (
                    <Text className={styles.timelineDeposit}>
                      {event.status === 'paid' ? '已交' : event.status === 'refunded' ? '已退' : event.status === 'frozen' ? '已冻结' : '已解冻'}
                    </Text>
                  )}
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
    </ScrollView>
  );
};

export default BoxDetailPage;
