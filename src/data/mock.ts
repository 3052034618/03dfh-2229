import type { BoxItem, BookingRecord, DisputeRecord, UserInfo } from '@/types';

export const mockUser: UserInfo = {
  id: 'u001',
  name: '张经理',
  phone: '13800138000',
  storeCode: 'SH00128',
  storeName: '鲜丰生鲜-静安店',
  deposit: 1500,
  totalBoxes: 12
};

export const mockBoxList: BoxItem[] = [
  {
    id: 'b001',
    boxNo: 'LWX-2024-08921',
    status: 'to_return',
    borrowDays: 5,
    depositStatus: 'paid',
    depositAmount: 300,
    suggestedReturnTime: '2024-06-22 18:00',
    temperature: 3.2,
    borrowTime: '2024-06-16 09:30',
    latestLocation: '上海市静安区南京西路1266号',
    specs: '60L标准箱'
  },
  {
    id: 'b002',
    boxNo: 'LWX-2024-08922',
    status: 'to_return',
    borrowDays: 3,
    depositStatus: 'paid',
    depositAmount: 300,
    suggestedReturnTime: '2024-06-24 18:00',
    temperature: 4.1,
    borrowTime: '2024-06-18 14:20',
    latestLocation: '上海市静安区南京西路1266号',
    specs: '60L标准箱'
  },
  {
    id: 'b003',
    boxNo: 'LWX-2024-08923',
    status: 'to_return',
    borrowDays: 7,
    depositStatus: 'unpaid',
    depositAmount: 300,
    suggestedReturnTime: '2024-06-20 18:00',
    temperature: 5.0,
    borrowTime: '2024-06-14 10:00',
    latestLocation: '上海市静安区南京西路1266号',
    specs: '40L小型箱'
  },
  {
    id: 'b004',
    boxNo: 'LWX-2024-09001',
    status: 'arrived_today',
    borrowDays: 0,
    depositStatus: 'paid',
    depositAmount: 300,
    suggestedReturnTime: '2024-06-28 18:00',
    temperature: 2.8,
    borrowTime: '2024-06-21 08:30',
    latestLocation: '冷链配送中心',
    specs: '60L标准箱'
  },
  {
    id: 'b005',
    boxNo: 'LWX-2024-09002',
    status: 'arrived_today',
    borrowDays: 0,
    depositStatus: 'paid',
    depositAmount: 300,
    suggestedReturnTime: '2024-06-28 18:00',
    temperature: 3.0,
    borrowTime: '2024-06-21 08:30',
    latestLocation: '冷链配送中心',
    specs: '80L大型箱'
  },
  {
    id: 'b006',
    boxNo: 'LWX-2024-08856',
    status: 'abnormal',
    borrowDays: 12,
    depositStatus: 'paid',
    depositAmount: 300,
    suggestedReturnTime: '2024-06-15 18:00',
    temperature: 8.5,
    borrowTime: '2024-06-09 11:00',
    latestLocation: '上海市静安区南京西路1266号',
    specs: '60L标准箱'
  },
  {
    id: 'b007',
    boxNo: 'LWX-2024-08890',
    status: 'in_use',
    borrowDays: 2,
    depositStatus: 'paid',
    depositAmount: 300,
    suggestedReturnTime: '2024-06-25 18:00',
    temperature: 3.5,
    borrowTime: '2024-06-19 16:00',
    latestLocation: '上海市静安区南京西路1266号',
    specs: '60L标准箱'
  }
];

export const mockBookingList: BookingRecord[] = [
  {
    id: 'bk001',
    boxCount: 3,
    timeSlot: '今天 14:00-16:00',
    address: '上海市静安区南京西路1266号鲜丰生鲜静安店',
    status: 'accepted',
    createTime: '2024-06-21 09:30',
    carrierName: '李师傅',
    carrierPhone: '13900139000',
    estimatedArrivalTime: '14:30',
    boxNos: ['LWX-2024-08921', 'LWX-2024-08922', 'LWX-2024-08923']
  },
  {
    id: 'bk002',
    boxCount: 2,
    timeSlot: '昨天 10:00-12:00',
    address: '上海市静安区南京西路1266号鲜丰生鲜静安店',
    status: 'completed',
    createTime: '2024-06-20 08:00',
    carrierName: '王师傅',
    carrierPhone: '13900139001',
    boxNos: ['LWX-2024-08800', 'LWX-2024-08801']
  },
  {
    id: 'bk003',
    boxCount: 1,
    timeSlot: '明天 09:00-11:00',
    address: '上海市静安区南京西路1266号鲜丰生鲜静安店',
    status: 'pending',
    createTime: '2024-06-21 10:00'
  }
];

export const mockDisputeList: DisputeRecord[] = [
  {
    id: 'dp001',
    boxNo: 'LWX-2024-08700',
    type: 'not_returned',
    status: 'resolved',
    description: '系统显示未归还，但我店已于6月10日交还给配送员李师傅，附交接单照片。',
    images: [
      'https://picsum.photos/id/326/400/300',
      'https://picsum.photos/id/431/400/300'
    ],
    createTime: '2024-06-12 15:30',
    reply: '经核实，该箱体确已归还，系统状态已更新。押金将在1-3个工作日内原路退回。',
    replyTime: '2024-06-13 10:20'
  },
  {
    id: 'dp002',
    boxNo: 'LWX-2024-08856',
    type: 'damaged',
    status: 'reviewing',
    description: '箱体表面有轻微划痕，不影响使用，申请减免赔偿。',
    images: [
      'https://picsum.photos/id/1/400/300'
    ],
    createTime: '2024-06-20 11:00'
  }
];

export const mockTimeSlots = [
  '今天 09:00-11:00',
  '今天 11:00-13:00',
  '今天 14:00-16:00',
  '今天 16:00-18:00',
  '明天 09:00-11:00',
  '明天 11:00-13:00',
  '明天 14:00-16:00',
  '明天 16:00-18:00'
];

export const mockArrivalCheckItems = [
  { label: '箱体外观', key: 'appearance', value: '' },
  { label: '封签完好', key: 'seal', value: '' },
  { label: '温度指示卡', key: 'temperature', value: '' }
];
