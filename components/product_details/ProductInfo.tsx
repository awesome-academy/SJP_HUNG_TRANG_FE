"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Share2, Truck, RotateCcw, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { formatPriceVnd } from "@/lib/mock-db";
import { useTranslations } from "next-intl";
import AddToCartButton from "@/components/products/AddToCartButton";
import { socialButtons } from "./ui";

interface ProductInfoProps {
  product: Product;
  locale: "vi" | "en";
}
function SocialShare({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {socialButtons.map((btn) => (
        <button
          key={btn.labelKey}
          className={cn(
            "flex items-center gap-1 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors cursor-pointer",
            btn.bg,
            `hover:${btn.hoverBg}`
          )}
        >
          {t(btn.labelKey)}{" "}
          <span className={cn(`${btn.hoverBg} px-1.5 py-0.5 rounded ml-1`)}>
            {btn.count}
          </span>
        </button>
      ))}
    </div>
  );
}


export default function ProductInfo({ product, locale }: ProductInfoProps) {
  const t = useTranslations("ProductDetails.info");
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>();
  const [selectedSize, setSelectedSize] = useState<string>();

  const hasVariants = (product.variants ?? []).length > 0;
  const colors = [...new Set(product.variants?.map((v) => v.color))];
  const sizes = [...new Set(product.variants?.map((v) => v.size))];

  const selectedVariant = product.variants?.find(
    (v) => v.color === selectedColor && v.size === selectedSize,
  );

  const stock = hasVariants ? selectedVariant?.stock ?? 0 : product.stock;

  const inStock = stock > 0;

  const canAddToCart = hasVariants ? !!selectedVariant && stock > 0 : stock > 0;

  useEffect(() => {
    if (stock === 0) {
      setQuantity(1);
    } else {
      setQuantity((prev) => Math.min(Math.max(prev, 1), stock));
    }
  }, [stock]);

  return (
    <div className="flex flex-col gap-4">
      {/* Name */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 leading-snug uppercase tracking-wide">
          {product.name}
        </h1>
        <p className="text-xs text-gray-400 mt-1">ID: #{product.id}</p>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-extrabold text-gray-900">
          {formatPriceVnd(product.price, locale)}
        </span>
      </div>

      {/* Stock status */}
      <div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
            inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500",
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              inStock ? "bg-green-500" : "bg-red-400",
            )}
          />
          {inStock ? t("inStock", { count: stock }) : t("outOfStock")}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {product.description}
      </p>

      <Separator />

      {hasVariants && (
        <>
          <div>
            <label className="text-xs font-semibold">{t("color")}</label>
            <div className="flex gap-2 mt-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "px-3 py-1 border rounded text-sm font-bold",
                    selectedColor === color &&
                      "border-green-600 bg-green-600 text-white",
                  )}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold">{t("size")}</label>
            <div className="flex gap-2 mt-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "px-3 py-1 border rounded text-sm font-bold",
                    selectedSize === size &&
                      "border-green-600 bg-green-600 text-white",
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      {/* Quantity + Add to cart */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
          {t("quantity")}
        </label>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold border-x border-gray-200">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(stock, quantity + 1))}
              disabled={!inStock}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <AddToCartButton
            product={product}
            disabled={!canAddToCart}
            quantity={quantity}
            variant={
              selectedVariant
                ? {
                    id: selectedVariant.id,
                    color: selectedVariant.color,
                    size: selectedVariant.size,
                    stock: selectedVariant.stock,
                  }
                : undefined
            }
            className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white font-semibold rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            labels={{
              add: t("addToCart"),
              outOfStock: t("outOfStock"),
            }}
          />

          <button className="w-10 h-10 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 cursor-pointer">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Shipping & Returns */}
      <div className="flex items-center gap-2 text-sm">
        <button className="text-green-600 font-medium flex items-center gap-1 hover:underline cursor-pointer">
          <Truck className="w-4 h-4" />
          {t("shippingReturns")}
        </button>
      </div>

      {/* Social share */}
      <SocialShare t={t} />

      {/* Trust badges */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Shield className="w-3.5 h-3.5 text-green-500" />
          {t("warranty")}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <RotateCcw className="w-3.5 h-3.5 text-green-500" />
          {t("returns")}
        </div>
      </div>
    </div>
  );
}
