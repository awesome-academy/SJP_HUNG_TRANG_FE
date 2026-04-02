import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { SideProduct } from "@/types/product";
import { BEST_SELLERS, FREQUENTLY_BOUGHT } from "./ui";
import { useTranslations } from "next-intl";

// StarRating

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-3 h-3",
            i < Math.floor(rating) ? "fill-[#f5c518] text-[#f5c518]" : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
    </div>
  );
}

// SideProductCard 

function SideProductCard({ name, price, rating, reviews }: SideProduct) {
  const t = useTranslations("ProductDetails.sidebar");
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors">
      <div className="w-14 h-14 rounded bg-rose-50 flex-shrink-0 flex items-center justify-center text-rose-200 text-xs font-medium border border-rose-100 ml-3">
        {t("image")}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
        <StarRating rating={rating} />
        <p className="text-xs text-gray-400 mt-0.5">( {reviews} {t("purchases")} )</p>
        <p className="text-sm font-bold mt-0.5">
          {price.toLocaleString("vi-VN")}đ
        </p>
      </div>
    </div>
  );
}

// SidebarSection

function SidebarSection({ title, products }: { title: string; products: SideProduct[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b-2 border-green-600 pb-2 mb-3">
        {title}
      </h3>
      {products.map((p) => (
        <SideProductCard key={p.id} {...p} />
      ))}
    </div>
  );
}

// ProductSidebar

export default function ProductSidebar() {
  const t = useTranslations("ProductDetails.sidebar");
  return (
    <div className="space-y-6">
      <SidebarSection title={t("bestSellers")} products={BEST_SELLERS} />
      <SidebarSection title={t("frequentlyBought")} products={FREQUENTLY_BOUGHT} />
    </div>
  );
}
