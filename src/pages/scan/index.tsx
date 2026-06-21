import React, { useState } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useApp } from '@/store/app';
import type { BoxItem } from '@/types';

interface CheckItem {
  key: string;
  label: string;
  value: 'normal' | 'abnormal' | '';
}

const ScanPage: React.FC = () => {
  const { boxList, updateBoxStatus, addBox } = useApp();
  const [boxNoInput, setBoxNoInput] = useState('');
  const [currentBox, setCurrentBox] = useState<BoxItem | null>(null);
  const [checkItems, setCheckItems] = useState<CheckItem[]>([
    { key: 'appearance', label: '箱体外观', value: '' },
    { key: 'seal', label: '封签完好', value: '' },
    { key: 'temperature', label: '温度指示卡', value: '' }
  ]);
  const [abnormalDesc, setAbnormalDesc] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleScan = () => {
    console.log('[Scan] scan code');
    Taro.scanCode({
      success: (res) => {
        console.log('[Scan] scan result:', res.result);
        const boxNo = res.result || 'LWX-2024-09003';
        setBoxNoInput(boxNo);
        findBox(boxNo);
      },
      fail: (err) => {
        console.error('[Scan] scan failed:', err);
        Taro.showToast({
          title: '扫码失败，请手动输入',
          icon: 'none'
        });
      }
    });
  };

  const findBox = (boxNo: string) => {
    const existingBox = boxList.find(b => b.boxNo === boxNo);
    const box = existingBox || {
      id: 'box_' + Date.now(),
      boxNo: boxNo,
      status: 'arrived_today' as const,
      borrowDays: 0,
      depositStatus: 'paid' as const,
      depositAmount: 300,
      suggestedReturnTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' '),
      temperature: 3.5,
      borrowTime: new Date().toISOString(),
      latestLocation: '',
      specs: '60L标准箱'
    };

    if (!existingBox) {
      addBox(box);
    }

    setCurrentBox(box);
    setCheckItems([
      { key: 'appearance', label: '箱体外观', value: '' },
      { key: 'seal', label: '封签完好', value: '' },
      { key: 'temperature', label: '温度指示卡', value: '' }
    ]);
    setAbnormalDesc('');
  };

  const handleManualConfirm = () => {
    if (!boxNoInput.trim()) {
      Taro.showToast({ title: '请输入箱号', icon: 'none' });
      return;
    }
    findBox(boxNoInput.trim());
  };

  const handleCheckClick = (key: string, value: 'normal' | 'abnormal') => {
    setCheckItems(prev =>
      prev.map(item =>
        item.key === key ? { ...item, value } : item
      )
    );
  };

  const canSubmit = () => {
    return currentBox && checkItems.every(item => item.value !== '');
  };

  const hasAbnormal = () => {
    return checkItems.some(item => item.value === 'abnormal');
  };

  const handleSubmit = async () => {
    if (!canSubmit() || submitting) return;

    setSubmitting(true);
    console.log('[Scan] submit arrival check', {
      boxNo: currentBox?.boxNo,
      checkItems,
      abnormalDesc
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (currentBox) {
        const newStatus: BoxItem['status'] = checkItems.some(item => item.value === 'abnormal')
          ? 'abnormal'
          : 'in_use';
        updateBoxStatus(currentBox.id, newStatus);
        console.log('[Scan] box status updated to:', newStatus);
      }
      setShowSuccess(true);
    } catch (err) {
      console.error('[Scan] submit error:', err);
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setCurrentBox(null);
    setBoxNoInput('');
    setCheckItems([
      { key: 'appearance', label: '箱体外观', value: '' },
      { key: 'seal', label: '封签完好', value: '' },
      { key: 'temperature', label: '温度指示卡', value: '' }
    ]);
    setAbnormalDesc('');
  };

  return (
    <View className={styles.page}>
      <View className={styles.scanSection}>
        <View className={styles.scanButton} onClick={handleScan}>
          <Text className={styles.scanIcon}>📱</Text>
          <Text className={styles.scanText}>扫码确认到货</Text>
        </View>
        <Text className={styles.scanTip}>对准箱体二维码扫描，快速确认到货</Text>
      </View>

      <View className={styles.manualSection}>
        <Text className={styles.manualLabel}>扫码不方便？手动输入箱号</Text>
        <View className={styles.inputRow}>
          <Input
            className={styles.inputBox}
            placeholder="请输入箱号，如 LWX-2024-08921"
            value={boxNoInput}
            onInput={(e) => setBoxNoInput(e.detail.value)}
          />
          <View
            className={classnames(styles.confirmBtn, !boxNoInput.trim() && styles.confirmBtnDisabled)}
            onClick={handleManualConfirm}
          >
            <Text>确认</Text>
          </View>
        </View>
      </View>

      {currentBox && (
        <View className={styles.checkSection}>
          <View className={styles.checkCard}>
            <View className={styles.boxInfoRow}>
              <Text className={styles.boxInfoLabel}>箱号</Text>
              <Text className={styles.boxInfoValue}>{currentBox.boxNo}</Text>
            </View>

            {checkItems.map(item => (
              <View key={item.key} className={styles.checkItem}>
                <Text className={styles.checkLabel}>{item.label}</Text>
                <View className={styles.checkButtons}>
                  <View
                    className={classnames(
                      styles.checkBtn,
                      item.value === 'normal' && styles.checkBtnNormalActive
                    )}
                    onClick={() => handleCheckClick(item.key, 'normal')}
                  >
                    <Text>正常</Text>
                  </View>
                  <View
                    className={classnames(
                      styles.checkBtn,
                      item.value === 'abnormal' && styles.checkBtnAbnormalActive
                    )}
                    onClick={() => handleCheckClick(item.key, 'abnormal')}
                  >
                    <Text>异常</Text>
                  </View>
                </View>
              </View>
            ))}

            {hasAbnormal() && (
              <View className={styles.abnormalDescSection}>
                <Text className={styles.abnormalDescLabel}>异常情况描述（选填）</Text>
                <Textarea
                  className={styles.abnormalDescInput}
                  placeholder="请描述具体异常情况，方便客服跟进"
                  value={abnormalDesc}
                  onInput={(e) => setAbnormalDesc(e.detail.value)}
                  maxlength={200}
                />
              </View>
            )}
          </View>
        </View>
      )}

      {currentBox && (
        <View className={styles.submitBar}>
          <View
            className={classnames(
              styles.submitBtn,
              !canSubmit() && styles.submitBtnDisabled
            )}
            onClick={handleSubmit}
          >
            <Text>{submitting ? '提交中...' : '确认到货'}</Text>
          </View>
        </View>
      )}

      {showSuccess && (
        <View className={styles.successModal} onClick={handleSuccessClose}>
          <View className={styles.successCard} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.successIcon}>✅</Text>
            <Text className={styles.successTitle}>到货确认成功</Text>
            <Text className={styles.successDesc}>
              箱体已进入您的占用状态{'\n'}
              请在建议归还时间前预约回收
            </Text>
            <View className={styles.successBtn} onClick={handleSuccessClose}>
              <Text>我知道了</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ScanPage;
