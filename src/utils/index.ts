export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${month}月${day}日 ${hour}:${minute}`;
};

export const getStatusText = (status: string, context?: 'dispute' | 'booking' | 'box' | 'deposit'): string => {
  if (context === 'dispute') {
    const disputeMap: Record<string, string> = {
      'pending': '客服复核中',
      'reviewing': '客服复核中',
      'resolved': '已解决',
      'rejected': '已驳回'
    };
    return disputeMap[status] || status;
  }

  if (context === 'deposit') {
    const depositMap: Record<string, string> = {
      'paid': '已交',
      'unpaid': '未交',
      'refunded': '已退还',
      'frozen': '已冻结'
    };
    return depositMap[status] || status;
  }

  const statusMap: Record<string, string> = {
    'to_return': '待归还',
    'arrived_today': '今日到货',
    'abnormal': '异常待确认',
    'in_use': '使用中',
    'returned': '已归还',
    'booked_for_recycle': '已预约回收',
    'pending': '待接单',
    'accepted': '已接单',
    'picked_up': '已取件',
    'completed': '已完成',
    'cancelled': '已取消',
    'reviewing': '复核中',
    'resolved': '已解决',
    'rejected': '已驳回'
  };
  return statusMap[status] || status;
};

export const getDepositTypeText = (type: string): string => {
  const map: Record<string, string> = {
    'occupy': '押金占用',
    'refund': '押金退还',
    'freeze': '押金冻结',
    'unfreeze': '押金解冻'
  };
  return map[type] || type;
};

export const getDepositText = (status: string): string => {
  const map: Record<string, string> = {
    'paid': '押金已交',
    'unpaid': '未交押金',
    'refunded': '押金已退'
  };
  return map[status] || status;
};

export const getBoxSpecsText = (specs?: string): string => {
  return specs || '60L标准箱';
};

export const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};
