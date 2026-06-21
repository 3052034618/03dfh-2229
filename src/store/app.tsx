import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { BoxItem, BookingRecord, DisputeRecord } from '@/types';
import { mockBoxList, mockBookingList, mockDisputeList } from '@/data/mock';

interface AppContextType {
  boxList: BoxItem[];
  bookingList: BookingRecord[];
  disputeList: DisputeRecord[];
  updateBoxStatus: (boxId: string, status: BoxItem['status']) => void;
  addBox: (box: BoxItem) => void;
  addBooking: (booking: BookingRecord) => void;
  updateBooking: (id: string, data: Partial<BookingRecord>) => void;
  addDispute: (dispute: DisputeRecord) => void;
  updateDispute: (id: string, data: Partial<DisputeRecord>) => void;
  resetAllData: () => void;
  getBoxById: (id: string) => BoxItem | undefined;
  getBookingById: (id: string) => BookingRecord | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'cold_chain_app_data';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [boxList, setBoxList] = useState<BoxItem[]>(mockBoxList);
  const [bookingList, setBookingList] = useState<BookingRecord[]>(mockBookingList);
  const [disputeList, setDisputeList] = useState<DisputeRecord[]>(mockDisputeList);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.boxList) setBoxList(data.boxList);
        if (data.bookingList) setBookingList(data.bookingList);
        if (data.disputeList) setDisputeList(data.disputeList);
        console.log('[AppStore] loaded data from storage');
      }
    } catch (err) {
      console.error('[AppStore] load data error:', err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        boxList,
        bookingList,
        disputeList
      }));
    } catch (err) {
      console.error('[AppStore] save data error:', err);
    }
  }, [boxList, bookingList, disputeList]);

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

  const addBox = useCallback((box: BoxItem) => {
    console.log('[AppStore] addBox', box.boxNo);
    setBoxList(prev => [box, ...prev]);
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
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('[AppStore] clear storage error:', err);
    }
  }, []);

  const getBoxById = useCallback((id: string) => {
    return boxList.find(b => b.id === id);
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
        addBox,
        addBooking,
        updateBooking,
        addDispute,
        updateDispute,
        resetAllData,
        getBoxById,
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
