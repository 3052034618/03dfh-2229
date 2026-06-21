import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import StatusTag from '@/components/StatusTag';
import { getStatusText, getDepositText } from '@/utils';
import type { BoxItem } from '@/types';
import styles from './index.module.scss';

interface BoxCardProps {
  box: BoxItem;
  showDetails?: boolean;
  onClick?: () => void;
}

const BoxCard: React.FC<BoxCardProps> = ({ box, showDetails = false, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/box-detail/index?id=${box.id}`
      });
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.boxNoRow}>
          <Text className={styles.boxNo}>{box.boxNo}</Text>
          <StatusTag status={box.status} text={getStatusText(box.status)} />
        </View>
        {box.specs && <Text className={styles.specs}>{box.specs}</Text>}
      </View>

      <View className={styles.cardBody}>
        <View className={styles.infoRow}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>借用天数</Text>
            <Text className={styles.infoValue}>
              <Text className={styles.daysNum}>{box.borrowDays}</Text>
              <Text className={styles.daysUnit}>天</Text>
            </Text>
          </View>
          <View className={styles.infoDivider} />
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>押金状态</Text>
            <Text
              className={styles.depositText}
              style={{ color: box.depositStatus === 'paid' ? '#00b42a' : '#ff7d00' }}
            >
              {getDepositText(box.depositStatus)}
            </Text>
          </View>
          <View className={styles.infoDivider} />
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>当前温度</Text>
            <Text className={styles.tempText}>
              {box.temperature !== undefined ? `${box.temperature}℃` : '--'}
            </Text>
          </View>
        </View>
      </View>

      {showDetails && (
        <View className={styles.cardFooter}>
          <Text className={styles.suggestLabel}>建议归还时间：</Text>
          <Text className={styles.suggestValue}>{box.suggestedReturnTime}</Text>
        </View>
      )}

      {!showDetails && (
        <View className={styles.cardFooterSimple}>
          <Text className={styles.suggestLabel}>建议</Text>
          <Text className={styles.suggestTime}>{box.suggestedReturnTime.slice(5)}</Text>
          <Text className={styles.arrow}>›</Text>
        </View>
      )}
    </View>
  );
};

export default BoxCard;
