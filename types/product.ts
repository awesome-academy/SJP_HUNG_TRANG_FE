export type ProductImage = {
  id?: string;
  url: string;
  isMain?: boolean;
  sortOrder?: number;
}

export type Variant = {
  id: string;
  color: string;
  size: string;
  stock: number;
}

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: string;
  images?: ProductImage[];
  variants?: Variant[];
}

export type SideProduct = {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviews: number;
}

export type ProductSuggestion = {
    id: string
    productName: string
    description?: string
    photos?: Array<{ id: string | number; url: string }>
}
