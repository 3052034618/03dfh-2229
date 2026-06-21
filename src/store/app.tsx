import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import Taro from '@tarojs/taro';
import type { BoxItem, BookingRecord, DisputeRecord, ArrivalCheckRecord, DepositRecord, TimelineEvent, StatusChangeRecord } from '@/types';
import { mockBoxList, mockBookingList, mockDisputeList, mockDepositList } from '@/data/mock';
import { generateId } from '@/utils';

interface AppContextType {
  boxList: BoxItem[];
  bookingList: BookingRecord[];
  disputeList: DisputeRecord[];
  depositList: DepositRecord[];
  updateBoxStatus: (boxId: string, status: BoxItem['status']) => void;
  updateBox: (boxId: string, data: Partial<BoxItem>) => void;
  addBox: (box: BoxItem) => void;
  setArrivalCheck: (boxId: string, checkRecord: ArrivalCheckRecord, newStatus: BoxItem['status']) => void;
  addBooking: (booking: BookingRecord, boxIds?: string[]) => void;
  cancelBooking: (bookingId: string) => void;
  completeBooking: (bookingId: string) => void;
  updateBooking: (id: string, data: Partial<BookingRecord>) => void;
  addDispute: (dispute: DisputeRecord) => void;
  updateDispute: (id: string, data: Partial<DisputeRecord>) => void;
  addDepositRecord: (record: DepositRecord) => void;
  resetAllData: () => void;
  getBoxById: (id: string) => BoxItem | undefined;
  getBoxByNo: (boxNo: string) => BoxItem | undefined;
  getBookingById: (id: string) => BookingRecord | undefined;
  getDisputeById: (id: string) => DisputeRecord | undefined;
  getTimelineForBox: (boxNo: string) => TimelineEvent[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'cold_chain_app_data';

const loadFromStorage = async () => {
  try {
    const res = await Taro.getStorage({ key: STORAGE_KEY });
    if (res.data) {
      return JSON.parse(res.data);
    }
  } catch (err) {
    console.warn('[AppStore] no saved data found');
  }
  return null;
};

const saveToStorage = async (data: unknown) => {
  try {
    await Taro.setStorage({
      key: STORAGE_KEY,
      data: JSON.stringify(data)
    });
  } catch (err) {
    console.error('[AppStore] save error:', err);
  }
};

const clearStorage = async () => {
  try {
    await Taro.removeStorage({ key: STORAGE_KEY });
  } catch (err) {
    console.error('[AppStore] clear error:', err);
  }
};

const addStatusChangeToBox = (
  box: BoxItem,
  fromStatus: BoxItem['status'],
  toStatus: BoxItem['status'],
  reason: string,
  relatedBookingId?: string,
  relatedDisputeId?: string
): BoxItem => {
  const change: StatusChangeRecord = {
    id: generateId(),
    boxNo: box.boxNo,
    fromStatus,
    toStatus,
    reason,
    relatedBookingId,
    relatedDisputeId,
    time: new Date().toISOString()
  };
  return {
    ...box,
    status: toStatus,
    previousStatus: fromStatus,
    statusChanges: [...(box.statusChanges || []), change]
  };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [boxList, setBoxList] = useState<BoxItem[]>(mockBoxList);
  const [bookingList, setBookingList] = useState<BookingRecord[]>(mockBookingList);
  const [disputeList, setDisputeList] = useState<DisputeRecord[]>(mockDisputeList);
  const [depositList, setDepositList] = useState<DepositRecord[]>(mockDepositList);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadFromStorage().then(data => {
      if (data) {
        if (data.boxList) setBoxList(data.boxList);
        if (data.bookingList) setBookingList(data.bookingList);
        if (data.disputeList) setDisputeList(data.disputeList);
        if (data.depositList) setDepositList(data.depositList);
        console.log('[AppStore] data loaded from storage');
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      saveToStorage({ boxList, bookingList, disputeList, depositList });
    }
  }, [boxList, bookingList, disputeList, depositList, loaded]);

  const updateBoxStatus = useCallback((boxId: string, status: BoxItem['status']) => {
    console.log('[AppStore] updateBoxStatus', { boxId, status });
    setBoxList(prev =>
      prev.map(box => {
        if (box.id === boxId || box.boxNo === boxId) {
          return addStatusChangeToBox(box, box.status, status, `状态变更为${status}`);
        }
        return box;
      })
    );
  }, []);

  const updateBox = useCallback((boxId: string, data: Partial<BoxItem>) => {
    console.log('[AppStore] updateBox', { boxId, data });
    setBoxList(prev =>
      prev.map(box =>
        box.id === boxId || box.boxNo === boxId
          ? { ...box, ...data }
          : box
      )
    );
  }, []);

  const addBox = useCallback((box: BoxItem) => {
    console.log('[AppStore] addBox', box.boxNo);
    setBoxList(prev => [box, ...prev]);
  }, []);

  const setArrivalCheck = useCallback((boxId: string, checkRecord: ArrivalCheckRecord, newStatus: BoxItem['status']) => {
    console.log('[AppStore] setArrivalCheck', { boxId, newStatus });
    setBoxList(prev =>
      prev.map(box => {
        if (box.id === boxId || box.boxNo === boxId) {
          const updated = addStatusChangeToBox(box, box.status, newStatus, newStatus === 'in_use' ? '确认到货，开始使用' : '到货检查异常', undefined, undefined);
          return { ...updated, arrivalCheck: checkRecord, borrowTime: new Date().toISOString() };
        }
        return box;
      })
    );
  }, []);

  const addBooking = useCallback((booking: BookingRecord, boxIds?: string[]) => {
    console.log('[AppStore] addBooking', booking.id, 'boxes:', boxIds);
    setBookingList(prev => [booking, ...prev]);
    
    if (boxIds && boxIds.length > 0) {
      setBoxList(prev =>
        prev.map(box => {
          if (boxIds.includes(box.id) || boxIds.includes(box.boxNo)) {
            const updated = addStatusChangeToBox(box, box.status, 'booked_for_recycle', '预约回收', booking.id, undefined);
            return { ...updated, bookingId: booking.id };
          }
          return box;
        })
      );

      const depositRecords: DepositRecord[] = boxIds.map(boxId => {
        const box = boxList.find(b => b.id === boxId || b.boxNo === boxId);
        return {
          id: generateId(),
          boxNo: box?.boxNo || boxId,
          type: 'occupy' as const,
          amount: box?.depositAmount || 300,
          status: 'paid' as const,
          description: `预约回收，押金占用（预约号：${booking.id}）`,
          relatedBookingId: booking.id,
          createTime: new Date().toISOString()
        };
      });
      setDepositList(prev => [...depositRecords, ...prev]);
    }
  }, [boxList]);

  const cancelBooking = useCallback((bookingId: string) => {
    console.log('[AppStore] cancelBooking', bookingId);
    setBookingList(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b)
    );
    setBoxList(prev =>
      prev.map(box => {
        if (box.bookingId === bookingId) {
          const prevStatus = box.previousStatus || 'in_use';
          const updated = addStatusChangeToBox(box, 'booked_for_recycle', prevStatus, '取消预约回收', bookingId, undefined);
          return { ...updated, bookingId: undefined };
        }
        return box;
      })
    );
    setDepositList(prev => {
      const bookingDeposits = prev.filter(d => d.relatedBookingId === bookingId && d.type === 'occupy');
      const refundRecords: DepositRecord[] = bookingDeposits.map(d => ({
        id: generateId(),
        boxNo: d.boxNo,
        type: 'refund' as const,
        amount: d.amount,
        status: 'refunded' as const,
        description: `取消预约回收，押金退回（预约号：${bookingId}）`,
        relatedBookingId: bookingId,
        createTime: new Date().toISOString()
      }));
      return [...refundRecords, ...prev];
    });
  }, []);

  const completeBooking = useCallback((bookingId: string) => {
    console.log('[AppStore] completeBooking', bookingId);
    setBookingList(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: 'completed' as const } : b)
    );
    setBoxList(prev =>
      prev.map(box => {
        if (box.bookingId === bookingId) {
          return addStatusChangeToBox(box, 'booked_for_recycle', 'returned', '回收完成', bookingId, undefined);
        }
        return box;
      })
    );
    setDepositList(prev => {
      const bookingDeposits = prev.filter(d => d.relatedBookingId === bookingId && d.type === 'occupy');
      const refundRecords: DepositRecord[] = bookingDeposits.map(d => ({
        id: generateId(),
        boxNo: d.boxNo,
        type: 'refund' as const,
        amount: d.amount,
        status: 'refunded' as const,
        description: `回收完成，押金退回（预约号：${bookingId}）`,
        relatedBookingId: bookingId,
        createTime: new Date().toISOString()
      }));
      return [...refundRecords, ...prev];
    });
  }, []);

  const updateBooking = useCallback((id: string, data: Partial<BookingRecord>) => {
    console.log('[AppStore] updateBooking', { id, data });
    setBookingList(prev =>
      prev.map(b => b.id === id ? { ...b, ...data } : b)
    );
  }, []);

  const addDispute = useCallback((dispute: DisputeRecord) => {
    console.log('[AppStore] addDispute', dispute.id);
    setDisputeList(prev => [dispute, ...prev]);
    setBoxList(prev =>
      prev.map(box => {
        if (box.boxNo === dispute.boxNo) {
          return addStatusChangeToBox(box, box.status, box.status, '提交争议反馈', undefined, dispute.id);
        }
        return box;
      })
    );
    const box = boxList.find(b => b.boxNo === dispute.boxNo);
    if (box) {
      const freezeRecord: DepositRecord = {
        id: generateId(),
        boxNo: dispute.boxNo,
        type: 'freeze',
        amount: box.depositAmount,
        status: 'frozen',
        description: `争议反馈，押金冻结（争议号：${dispute.id}）`,
        relatedDisputeId: dispute.id,
        createTime: new Date().toISOString()
      };
      setDepositList(prev => [freezeRecord, ...prev]);
    }
  }, [boxList]);

  const updateDispute = useCallback((id: string, data: Partial<DisputeRecord>) => {
    console.log('[AppStore] updateDispute', { id, data });
    setDisputeList(prev =>
      prev.map(d => d.id === id ? { ...d, ...data } : d)
    );
    if (data.status === 'resolved') {
      const dispute = disputeList.find(d => d.id === id);
      if (dispute) {
        const unfreezeRecord: DepositRecord = {
          id: generateId(),
          boxNo: dispute.boxNo,
          type: 'unfreeze',
          amount: 300,
          status: 'refunded',
          description: `争议已解决，押金解冻（争议号：${id}）`,
          relatedDisputeId: id,
          createTime: new Date().toISOString()
        };
        setDepositList(prev => [unfreezeRecord, ...prev]);
      }
    }
  }, [disputeList]);

  const addDepositRecord = useCallback((record: DepositRecord) => {
    console.log('[AppStore] addDepositRecord', record.id);
    setDepositList(prev => [record, ...prev]);
  }, []);

  const resetAllData = useCallback(() => {
    console.log('[AppStore] resetAllData');
    setBoxList(mockBoxList);
    setBookingList(mockBookingList);
    setDisputeList(mockDisputeList);
    setDepositList(mockDepositList);
    clearStorage();
  }, []);

  const getBoxById = useCallback((id: string) => {
    return boxList.find(b => b.id === id);
  }, [boxList]);

  const getBoxByNo = useCallback((boxNo: string) => {
    return boxList.find(b => b.boxNo === boxNo);
  }, [boxList]);

  const getBookingById = useCallback((id: string) => {
    return bookingList.find(b => b.id === id);
  }, [bookingList]);

  const getDisputeById = useCallback((id: string) => {
    return disputeList.find(d => d.id === id);
  }, [disputeList]);

  const getStatusChangeTitle = (from: string, to: string, reason: string): string => {
    if (reason.includes('确认到货')) return '确认到货';
    if (reason.includes('预约回收')) return '预约回收';
    if (reason.includes('取消预约')) return '取消预约回收';
    if (reason.includes('回收完成')) return '回收完成';
    if (reason.includes('争议')) return '提交争议';
    return reason;
  };

  const getTimelineForBox = useCallback((boxNo: string): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const box = boxList.find(b => b.boxNo === boxNo);

    if (box?.arrivalCheck) {
      events.push({
        id: `arrival_${boxNo}`,
        type: 'arrival_check',
        title: '到货检查',
        time: box.arrivalCheck.checkTime,
        desc: box.arrivalCheck.abnormalDesc || '到货检查已完成，箱体状态正常',
        status: box.arrivalCheck.items.every(i => i.value === 'normal') ? 'normal' : 'abnormal',
        relatedId: box.id,
        relatedType: undefined
      });
    }

    const boxBookings = bookingList.filter(b => b.boxNos?.includes(boxNo));
    boxBookings.forEach(booking => {
      events.push({
        id: `booking_${booking.id}`,
        type: 'booking',
        title: booking.status === 'cancelled' ? '预约回收（已取消）' : '预约回收',
        time: booking.createTime,
        desc: `预约时间：${booking.timeSlot}，箱数：${booking.boxCount}个`,
        status: booking.status,
        relatedId: booking.id,
        relatedType: 'booking'
      });
    });

    const boxDisputes = disputeList.filter(d => d.boxNo === boxNo);
    boxDisputes.forEach(dispute => {
      const typeText = dispute.type === 'not_returned' ? '未归还争议' : dispute.type === 'damaged' ? '损坏争议' : '其他问题';
      events.push({
        id: `dispute_${dispute.id}`,
        type: 'dispute',
        title: typeText,
        time: dispute.createTime,
        desc: dispute.description.slice(0, 50) + (dispute.description.length > 50 ? '...' : ''),
        status: dispute.status,
        relatedId: dispute.id,
        relatedType: 'dispute'
      });
    });

    if (box?.statusChanges && box.statusChanges.length > 0) {
      box.statusChanges.forEach(change => {
        events.push({
          id: change.id,
          type: 'status_change',
          title: getStatusChangeTitle(change.fromStatus, change.toStatus, change.reason),
          time: change.time,
          desc: change.reason,
          status: change.toStatus,
          previousStatus: change.fromStatus,
          relatedId: change.relatedBookingId || change.relatedDisputeId,
          relatedType: change.relatedBookingId ? 'booking' : change.relatedDisputeId ? 'dispute' : undefined
        });
      });
    }

    const boxDeposits = depositList.filter(d => d.boxNo === boxNo);
    boxDeposits.forEach(deposit => {
      events.push({
        id: `deposit_${deposit.id}`,
        type: 'deposit',
        title: deposit.type === 'occupy' ? '押金占用' : deposit.type === 'refund' ? '押金退回' : deposit.type === 'freeze' ? '押金冻结' : '押金解冻',
        time: deposit.createTime,
        desc: deposit.description,
        status: deposit.status,
        relatedId: deposit.relatedBookingId || deposit.relatedDisputeId,
        relatedType: deposit.relatedBookingId ? 'booking' : undefined
      });
    });

    if (box?.borrowTime) {
      events.push({
        id: `status_${boxNo}_borrow`,
        type: 'status_change',
        title: '开始借用',
        time: box.borrowTime,
        desc: `箱体送达 ${box.latestLocation || '门店'}，开始占用`,
        status: 'in_use'
      });
    }

    return events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [boxList, bookingList, disputeList, depositList]);

  return (
    <AppContext.Provider
      value={{
        boxList,
        bookingList,
        disputeList,
        depositList,
        updateBoxStatus,
        updateBox,
        addBox,
        setArrivalCheck,
        addBooking,
        cancelBooking,
        completeBooking,
        updateBooking,
        addDispute,
        updateDispute,
        addDepositRecord,
        resetAllData,
        getBoxById,
        getBoxByNo,
        getBookingById,
        getDisputeById,
        getTimelineForBox
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
