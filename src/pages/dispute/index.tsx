import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { useApp } from '@/store/app';
import { formatDateTime, getStatusText, generateId } from '@/utils';
import type { DisputeRecord } from '@/types';

const disputeTypes = [
  { key: 'not_returned', label: '未归还争议' },
  { key: 'damaged', label: '损坏争议' },
  { key: 'other', label: '其他问题' }
];

const DisputePage: React.FC = () => {
  const router = useRouter();
  const { disputeList, addDispute } = useApp();
  const [boxNo, setBoxNo] = useState('');
  const [type, setType] = useState<string>('not_returned');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (router.params.boxNo) {
      setBoxNo(router.params.boxNo);
    }
  }, [router.params.boxNo]);

  const canSubmit = () => {
    return boxNo.trim() && description.trim().length >= 10;
  };

  const handleTypeSelect = (key: string) => {
    setType(key);
  };

  const handleAddImage = () => {
    if (images.length >= 6) {
      Taro.showToast({ title: '最多上传6张图片', icon: 'none' });
      return;
    }

    Taro.chooseImage({
      count: 6 - images.length,
      success: (res) => {
        console.log('[Dispute] images selected:', res.tempFilePaths?.length);
        const newImages = [
          ...images,
          ...(res.tempFilePaths || ['https://picsum.photos/id/' + (100 + images.length) + '/400/300'])
        ];
        setImages(newImages);
      },
      fail: () => {
        const mockImages = [
          'https://picsum.photos/id/292/400/300',
          'https://picsum.photos/id/431/400/300'
        ];
        setImages([...images, mockImages[images.length % mockImages.length]]);
      }
    });
  };

  const handleDeleteImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!canSubmit() || submitting) return;

    setSubmitting(true);
    console.log('[Dispute] submit dispute', { boxNo, type, description, imageCount: images.length });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newDispute: DisputeRecord = {
        id: generateId(),
        boxNo,
        type: type as DisputeRecord['type'],
        status: 'reviewing',
        description,
        images,
        createTime: new Date().toISOString()
      };

      addDispute(newDispute);
      setShowSuccess(true);
    } catch (err) {
      console.error('[Dispute] submit error:', err);
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setBoxNo('');
    setType('not_returned');
    setDescription('');
    setImages([]);
  };

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <View className={styles.formCard}>
          <Text className={styles.formTitle}>提交争议</Text>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>箱号</Text>
            <Input
              className={styles.inputBox}
              placeholder="请输入箱号"
              value={boxNo}
              onInput={(e) => setBoxNo(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>争议类型</Text>
            <View className={styles.typeSelector}>
              {disputeTypes.map(item => (
                <View
                  key={item.key}
                  className={classnames(
                    styles.typeItem,
                    type === item.key && styles.typeItemActive
                  )}
                  onClick={() => handleTypeSelect(item.key)}
                >
                  <Text>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>问题描述</Text>
            <Textarea
              className={styles.descInput}
              placeholder="请详细描述您遇到的问题，至少10个字"
              value={description}
              onInput={(e) => setDescription(e.detail.value)}
              maxlength={500}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>上传凭证（选填，最多6张）</Text>
            <View className={styles.uploadSection}>
              {images.map((img, index) => (
                <View key={index} className={styles.uploadItem}>
                  <Image className={styles.uploadImg} src={img} mode="aspectFill" />
                  <View className={styles.deleteBtn} onClick={() => handleDeleteImage(index)}>
                    <Text>×</Text>
                  </View>
                </View>
              ))}
              {images.length < 6 && (
                <View className={styles.uploadAdd} onClick={handleAddImage}>
                  <Text className={styles.uploadAddIcon}>+</Text>
                  <Text className={styles.uploadAddText}>上传图片</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.recordsTitle}>历史记录</Text>
        {disputeList.map(record => (
          <View key={record.id} className={styles.recordCard}>
            <View className={styles.recordHeader}>
              <Text className={styles.recordBoxNo}>{record.boxNo}</Text>
              <StatusTag
                status={record.status}
                text={getStatusText(record.status, 'dispute')}
                type={record.status === 'reviewing' ? 'warning' : undefined}
              />
            </View>
            <Text className={styles.recordDesc}>{record.description}</Text>
            {record.images.length > 0 && (
              <View className={styles.recordImages}>
                {record.images.slice(0, 3).map((img, idx) => (
                  <Image key={idx} className={styles.recordImg} src={img} mode="aspectFill" />
                ))}
              </View>
            )}
            {record.reply && (
              <View className={styles.replySection}>
                <Text className={styles.replyLabel}>客服回复</Text>
                <Text className={styles.replyContent}>{record.reply}</Text>
                {record.replyTime && (
                  <Text className={styles.replyTime}>{formatDateTime(record.replyTime)}</Text>
                )}
              </View>
            )}
            <View className={styles.recordFooter}>
              <Text className={styles.recordTime}>{formatDateTime(record.createTime)}</Text>
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
          <Text>{submitting ? '提交中...' : '提交反馈'}</Text>
        </View>
      </View>

      {showSuccess && (
        <View className={styles.successModal} onClick={handleSuccessClose}>
          <View className={styles.successCard} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.successIcon}>✅</Text>
            <Text className={styles.successTitle}>提交成功</Text>
            <Text className={styles.successDesc}>
              我们已收到您的反馈{'\n'}
              客服将在1-3个工作日内复核
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

export default DisputePage;
