import { SideProduct } from "@/types/product";

export const PRODUCT_IMAGES_BG = [
  "bg-rose-100",
  "bg-stone-100",
  "bg-amber-50",
  "bg-slate-100",
] as const;

export const socialButtons: { labelKey: string; count: number; bg: string; hoverBg: string }[] = [
  { labelKey: "like", count: 0, bg: "bg-blue-600", hoverBg: "bg-blue-700" },
  { labelKey: "tweet", count: 0, bg: "bg-sky-500", hoverBg: "bg-sky-600" },
  { labelKey: "googlePlus", count: 0, bg: "bg-red-500", hoverBg: "bg-red-600" },
];


export const BEST_SELLERS: SideProduct[] = Array.from({ length: 3 }, (_, i) => ({
  id: i,
  name: "Mỹ phẩm châu Âu",
  price: 355000,
  rating: 5,
  reviews: 4,
}));

export const FREQUENTLY_BOUGHT: SideProduct[] = Array.from({ length: 4 }, (_, i) => ({
  id: i,
  name: "Mỹ phẩm châu Âu",
  price: 355000,
  rating: 5,
  reviews: 4,
}));
