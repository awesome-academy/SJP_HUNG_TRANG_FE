export type Review = {
  id: string | number;
  userId: string | number;
  productId: string | number;
  rating: number;
  comment: string;
  createdAt: string;
  orderId?: string | number;
  variantSignature?: string;
}

export type ReviewVariantInput = {
  id?: string | number;
  color?: string;
  size?: string;
}

export type CreateReviewBody = {
  orderId?: string | number;
  productId?: string | number;
  rating?: number;
  comment?: string;
  variant?: ReviewVariantInput;
}
