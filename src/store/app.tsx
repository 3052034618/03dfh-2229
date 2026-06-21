import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import Taro from '@tarojs/taro';
import type { BoxItem, BookingRecord, DisputeRecord, ArrivalCheckRecord } from '@/types';
import { mockBoxList, mockBookingList, mockDisputeList } from '@/data/mock';

interface AppContextType {
  boxList: BoxItem[];
  bookingList: BookingRecord[];
  disputeList: DisputeRecord[];
  updateBoxStatus: (boxId: string, status: BoxItem['status']) => void;
  updateBox: (boxId: string, data: Partial<BoxItem>) => void;
  addBox: (box: BoxItem) => void;
  setArrivalCheck: (boxId: string, checkRecord: ArrivalCheckRecord) => void;
  addBooking: (booking: BookingRecord) => void;
  updateBooking: (id: string, data: Partial<BookingRecord>) => void;
  addDispute: (dispute: DisputeRecord) => void;
  updateDispute: (id: string, data: Partial<DisputeRecord>) => void;
  resetAllData: () => void;
  getBoxById: (id: string) => BoxItem | undefined;
  getBoxByNo: (boxNo: string) => BoxItem | undefined;
  getBookingById: (id: string) => BookingRecord | undefined;
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadFromStorage().then(data => {
      if (data) {
        if (data.boxList) setBoxList(data.boxList);
        if (data.bookingList) setBookingList(data.bookingList);
        if (data.disputeList) setDisputeList(data.disputeList);
        console.log('[AppStore] data loaded from storage');
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      saveToStorage({ boxList, bookingList, disputeList });
    }
  }, [boxList, bookingList, disputeList, loaded]);

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

  const addBooking = useCallback((booking: BookingRecord) => {
    console.log('[AppStore] addBooking', booking.id);
    setBookingList(prev => [booking, ...prev]);
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

  const resetAllData = useCallback(() => {
    console.log('[AppStore] resetAllData');
    setBoxList(mockBoxList);
    setBookingList(mockBookingList);
    setDisputeList(mockDisputeList);
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

  return (
    <AppContext.Provider
      value={{
        boxList,
        bookingList,
        disputeList,
        updateBoxStatus,
        updateBox,
        addBox,
        setArrivalCheck,
        addBooking,
        updateBooking,
        addDispute,
        updateDispute,
        resetAllData,
        getBoxById,
        getBoxByNo,
        getBookingById
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
