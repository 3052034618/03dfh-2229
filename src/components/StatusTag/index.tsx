import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatusTagProps {
  status: string;
  type?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'cold';
  text?: string;
  size?: 'normal' | 'small';
}

const typeMap: Record<string, string> = {
  default: 'default',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  cold: 'cold'
};

const statusTypeMap: Record<string, string> = {
  'to_return': 'warning',
  'arrived_today': 'info',
  'abnormal': 'error',
  'in_use': 'success',
  'returned': 'default',
  'booked_for_recycle': 'cold',
  'pending': 'warning',
  'accepted': 'info',
  'picked_up': 'success',
  'completed': 'success',
  'cancelled': 'default',
  'reviewing': 'warning',
  'resolved': 'success',
  'rejected': 'error',
  'paid': 'success',
  'unpaid': 'warning',
  'refunded': 'default',
  'frozen': 'error'
};

const StatusTag: React.FC<StatusTagProps> = ({ status, type, text, size = 'normal' }) => {
  const tagType = type || statusTypeMap[status] || 'default';
  const displayText = text || status;

  return (
    <View className={classnames(styles.tag, styles[typeMap[tagType] || 'default'], styles[size])}>
      <Text className={styles.tagText}>{displayText}</Text>
    </View>
  );
};

export default StatusTag;
