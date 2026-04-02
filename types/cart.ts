export type CartProduct = {
  id: string | number;
  name: string;
  price: number;
  stock: number;
  images: { id?: string | number; url: string; isMain?: boolean }[];
};
