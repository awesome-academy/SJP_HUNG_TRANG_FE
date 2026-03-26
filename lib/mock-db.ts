export type EmailSubscription = {
  id: number;
  email: string;
};

export type SuggestionPhoto = {
  id: number;
  url: string;
};

export type ProductSuggestion = {
  id: number;
  productName: string;
  description: string;
  photos: SuggestionPhoto[];
};

export type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

export type ProductImage = {
  id: number;
  url: string;
  isMain?: boolean;
  sortOrder?: number;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  images: ProductImage[];
};

export function getMainImage(images: ProductImage[]): string {
  const mainImage = images.find((image) => image.isMain);
  if (mainImage) {
    return mainImage.url;
  }

  if (images.length > 0) {
    return images[0].url;
  }

  return "/images/placeholder-product.jpg";
}

export function formatPriceVnd(value: number, locale: "vi" | "en" = "vi"): string {
  const numberLocale = locale === "en" ? "en-US" : "vi-VN";

  return new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}
