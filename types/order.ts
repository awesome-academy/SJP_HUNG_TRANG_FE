import { OrderStatus } from '@/constants/order_status';

export type Order = {
  id: string;
  userId: string | number;
  status: OrderStatus;
  totalPrice: number;
  fullName: string;
  phone: string;
  address: string;
  note: string;
  voucherCode?: string;
  createdAt: string;
  items: OrderItem[];
}

export type OrderItem = {
  productId: string
  productName: string
  price: number
  quantity: number
  variant?: OrderItemVariant
}

export type OrderItemVariant = {
  id?: string
  color?: string
  size?: string
}

export type RawOrderItem = {
  productId: string | number
  productName?: string
  price?: number
  quantity?: number
  variantId?: string | number
  variant?: {
    id?: string | number
    color?: string
    size?: string
  }
}

export type RawOrder = {
  id: string | number
  userId: string | number
  status?: string
  totalPrice?: number
  fullName?: string
  phone?: string
  address?: string
  shippingAddress?: {
    fullName?: string
    phone?: string
    address?: string
    note?: string
  }
  note?: string
  voucherCode?: string
  createdAt?: string
  items?: RawOrderItem[]
}




