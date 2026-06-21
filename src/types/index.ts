export interface UserInfo {
  id: string;
  name: string;
  phone: string;
  storeCode: string;
  storeName: string;
  avatar?: string;
  deposit: number;
  totalBoxes: number;
}

export type BoxStatus = 'to_return' | 'arrived_today' | 'abnormal' | 'in_use' | 'returned';

export type DepositStatus = 'paid' | 'unpaid' | 'refunded';

export interface BoxItem {
  id: string;
  boxNo: string;
  status: BoxStatus;
  borrowDays: number;
  depositStatus: DepositStatus;
  depositAmount: number;
  suggestedReturnTime: string;
  temperature?: number;
  borrowTime: string;
  latestLocation?: string;
  specs?: string;
}

export interface ArrivalCheckItem {
  label: string;
  key: string;
  value: 'normal' | 'abnormal' | '';
  abnormalDesc?: string;
}

export interface BookingRecord {
  id: string;
  boxCount: number;
  timeSlot: string;
  address: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'completed' | 'cancelled';
  createTime: string;
  carrierName?: string;
  carrierPhone?: string;
  estimatedArrivalTime?: string;
  boxNos?: string[];
}

export interface DisputeRecord {
  id: string;
  boxNo: string;
  type: 'not_returned' | 'damaged' | 'other';
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected';
  description: string;
  images: string[];
  createTime: string;
  reply?: string;
  replyTime?: string;
}

export type LoginType = 'phone' | 'store_code';
