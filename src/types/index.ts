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

export type BoxStatus = 'to_return' | 'arrived_today' | 'abnormal' | 'in_use' | 'returned' | 'booked_for_recycle';

export type DepositStatus = 'paid' | 'unpaid' | 'refunded' | 'frozen';

export type DepositType = 'occupy' | 'refund' | 'freeze' | 'unfreeze';

export interface DepositRecord {
  id: string;
  boxNo: string;
  type: DepositType;
  amount: number;
  status: DepositStatus;
  description: string;
  relatedBookingId?: string;
  relatedDisputeId?: string;
  createTime: string;
  operator?: string;
}

export interface TimelineEvent {
  id: string;
  type: 'arrival_check' | 'booking' | 'dispute' | 'status_change' | 'deposit';
  title: string;
  time: string;
  desc: string;
  status?: string;
  relatedId?: string;
  relatedType?: 'booking' | 'dispute';
  previousStatus?: BoxStatus;
}

export interface StatusChangeRecord {
  id: string;
  boxNo: string;
  fromStatus: BoxStatus;
  toStatus: BoxStatus;
  reason: string;
  relatedBookingId?: string;
  relatedDisputeId?: string;
  time: string;
}

export interface ArrivalCheckItem {
  label: string;
  key: string;
  value: 'normal' | 'abnormal' | '';
  abnormalDesc?: string;
}

export interface ArrivalCheckRecord {
  checkTime: string;
  items: ArrivalCheckItem[];
  abnormalDesc?: string;
  operator?: string;
}

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
  arrivalCheck?: ArrivalCheckRecord;
  bookingId?: string;
  previousStatus?: BoxStatus;
  statusChanges?: StatusChangeRecord[];
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
