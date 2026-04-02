"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, MoveUp, MoveDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { PRODUCT_IMAGES_BG } from "./ui";
import { useTranslations } from "next-intl";

interface ProductGalleryProps {
  product: Product;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const t = useTranslations("ProductDetails.gallery");
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlist, setWishlist] = useState(false);

  const imageCount = product.images.length;

  const handlePrev = () =>
    setSelectedImage((prev) => (prev === 0 ? imageCount - 1 : prev - 1));

  const handleNext = () =>
    setSelectedImage((prev) => (prev === imageCount - 1 ? 0 : prev + 1));

  const currentUrl = product?.images?.[selectedImage]?.url ?? null;

  return (
    <div className="lg:col-span-2 items-center flex flex-col md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex md:flex-col items-center gap-2 order-2 md:order-1">
        <button onClick={handlePrev} className="hidden md:flex w-8 h-6 justify-center items-center text-gray-400 hover:text-gray-700">
          <MoveUp className="w-4 h-4" />
        </button>

        {product.images
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((img) => (
          <button
            key={img.sortOrder}
            onClick={() => setSelectedImage(product.images.indexOf(img))}
            className={cn(
              "w-16 h-16 rounded border-2 overflow-hidden relative",
              selectedImage === product.images.indexOf(img)
                ? "border-green-500 shadow-md"
                : "border-gray-200 hover:border-gray-400"
            )}
          >
            {img.url ? (
              <Image
                src={img.url}
                alt={product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div
                className={cn(
                  "w-full h-full flex items-center justify-center text-xs text-gray-400",
                  PRODUCT_IMAGES_BG[(img.sortOrder ?? 0) % PRODUCT_IMAGES_BG.length]
                )}
              >
                0{(img.sortOrder ?? 0) + 1}
              </div>
            )}
          </button>
        ))}

        <button onClick={handleNext} className="hidden md:flex w-8 h-6 justify-center items-center text-gray-400 hover:text-gray-700">
          <MoveDown className="w-4 h-4" />
        </button>
      </div>

      {/* Main image */}
      <div className="flex-1 flex justify-center order-1 md:order-2">
        <div
          className={cn(
            "relative w-full max-w-[480px] aspect-square rounded-lg overflow-hidden border",
            PRODUCT_IMAGES_BG[selectedImage % PRODUCT_IMAGES_BG.length]
          )}
        >
          {currentUrl ? (
            <Image
              src={currentUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-contain"
              priority
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-sm">{t("noImages")}</span>
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={() => setWishlist(!wishlist)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center"
          >
            <Heart
              className={cn(
                "w-4 h-4",
                wishlist ? "fill-green-500 text-green-500" : "text-green-500"
              )}
            />
          </button>

          {/* Counter */}
          {imageCount > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
              {selectedImage + 1} / {imageCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
