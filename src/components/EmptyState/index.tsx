import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = '暂无数据',
  description = '',
  icon = '📦'
}) => {
  return (
    <View className={styles.empty}>
      <Text className={styles.icon}>{icon}</Text>
      <Text className={styles.title}>{title}</Text>
      {description && <Text className={styles.description}>{description}</Text>}
    </View>
  );
};

export default EmptyState;
