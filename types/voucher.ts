export type Voucher = {
  id: string;
  code: string;
  discountPercent: number;
  minOrderValue: number;
  expiredAt: string;
}
