export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_CONFIG = {
  [ORDER_STATUS.PENDING]: {
    label: 'Order Placed',
    color: 'warning',
    textColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    icon: '⏳',
  },
  [ORDER_STATUS.CONFIRMED]: {
    label: 'Confirmed',
    color: 'info',
    textColor: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
    icon: '✅',
  },
  [ORDER_STATUS.PREPARING]: {
    label: 'Cooking in Kitchen',
    color: 'brand',
    textColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    icon: '🍳',
  },
  [ORDER_STATUS.READY_FOR_PICKUP]: {
    label: 'Packed & Ready',
    color: 'info',
    textColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    icon: '📦',
  },
  [ORDER_STATUS.OUT_FOR_DELIVERY]: {
    label: 'Out for Delivery',
    color: 'brand',
    textColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    icon: '🛵',
  },
  [ORDER_STATUS.DELIVERED]: {
    label: 'Delivered',
    color: 'success',
    textColor: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    icon: '😋',
  },
  [ORDER_STATUS.CANCELLED]: {
    label: 'Cancelled',
    color: 'error',
    textColor: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    icon: '❌',
  },
};
