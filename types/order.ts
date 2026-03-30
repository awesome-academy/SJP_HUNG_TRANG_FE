import { OrderStatus } from "@/constants/order_status";

export type Order = {
  id: string;
  userId: number;
  status: OrderStatus;
  totalPrice: number;
  fullName: string;
  phone: string;
  address: string;
  note: string;
  voucherCode?: string;
  createdAt: string;
  items: {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
  }[];
};
