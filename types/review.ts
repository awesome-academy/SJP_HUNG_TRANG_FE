export type Review = {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  orderId?: string;
  variantSignature?: string;
}

export type ReviewVariantInput = {
  id?: string | number
  color?: string
  size?: string
}

export type CreateReviewBody = {
  orderId?: string
  productId?: string
  rating?: number
  comment?: string
  variant?: ReviewVariantInput
}
