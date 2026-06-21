import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import Taro from '@tarojs/taro';
import type { BoxItem, BookingRecord, DisputeRecord, ArrivalCheckRecord, DepositRecord, TimelineEvent } from '@/types';
import { mockBoxList, mockBookingList, mockDisputeList, mockDepositList } from '@/data/mock';
import { formatDateTime, getStatusText } from '@/utils';

interface AppContextType {
  boxList: BoxItem[];
  bookingList: BookingRecord[];
  disputeList: DisputeRecord[];
  depositList: DepositRecord[];
  updateBoxStatus: (boxId: string, status: BoxItem['status']) => void;
  updateBox: (boxId: string, data: Partial<BoxItem>) => void;
  addBox: (box: BoxItem) => void;
  setArrivalCheck: (boxId: string, checkRecord: ArrivalCheckRecord) => void;
  addBooking: (booking: BookingRecord, boxIds?: string[]) => void;
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
      prev.map(box =>
        box.id === boxId || box.boxNo === boxId
          ? { ...box, status, borrowTime: new Date().toISOString() }
          : box
      )
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

  const setArrivalCheck = useCallback((boxId: string, checkRecord: ArrivalCheckRecord) => {
    console.log('[AppStore] setArrivalCheck', { boxId });
    setBoxList(prev =>
      prev.map(box =>
        box.id === boxId || box.boxNo === boxId
          ? { ...box, arrivalCheck: checkRecord }
          : box
      )
    );
  }, []);

  const addBooking = useCallback((booking: BookingRecord, boxIds?: string[]) => {
    console.log('[AppStore] addBooking', booking.id, 'boxes:', boxIds);
    setBookingList(prev => [booking, ...prev]);
    
    if (boxIds && boxIds.length > 0) {
      setBoxList(prev =>
        prev.map(box => {
          if (boxIds.includes(box.id) || boxIds.includes(box.boxNo)) {
            return { ...box, status: 'booked_for_recycle', bookingId: booking.id };
          }
          return box;
        })
      );
    }
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
  }, []);

  const updateDispute = useCallback((id: string, data: Partial<DisputeRecord>) => {
    console.log('[AppStore] updateDispute', { id, data });
    setDisputeList(prev =>
      prev.map(d => d.id === id ? { ...d, ...data } : d)
    );
  }, []);

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
        title: '预约回收',
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
  }, [boxList, bookingList, disputeList]);

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
