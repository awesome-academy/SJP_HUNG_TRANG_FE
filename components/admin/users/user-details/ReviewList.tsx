import { Review } from "@/types/review";
import { EmptyState } from "../ui";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function ReviewList({ reviews }: { reviews: Review[] }) {
    const t = useTranslations("Admin.users_details");
  if (reviews.length === 0) return <EmptyState message={t("noReviews")} />;
  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-lg border border-gray-100 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3.5 h-3.5",
                    i < review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                  )}
                />
              ))}
              <span className="text-xs text-gray-400 ml-1">{review.rating}/5</span>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-2 leading-relaxed">{review.comment}</p>
          <p className="text-xs text-gray-400 mt-1">Sản phẩm #{review.productId}</p>
        </div>
      ))}
    </div>
  );
}
