"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { Review } from "@/types/review";
import { Comment } from "@/types/comment";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

// StarRating 

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            size === "sm" ? "w-3 h-3" : "w-4 h-4",
            i < Math.floor(rating)
              ? "fill-[#f5c518] text-[#f5c518]"
              : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
    </div>
  );
}

// ReviewCard 

function ReviewCard({ review }: { review: Review }) {
  const t = useTranslations("ProductDetails.tabs");

  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} />
          <span className="text-xs text-gray-400">
            {t("user")} #{review.userId}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
        </span>
      </div>
      <p className="text-sm text-gray-700 mt-2 leading-relaxed">{review.comment}</p>
    </div>
  );
}

// Rating summary 

function RatingSummary({ reviews }: { reviews: Review[] }) {
  const t = useTranslations("ProductDetails.tabs");

  if (reviews.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        {t("noReviews")}
      </p>
    );
  }

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  // Count per star
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    width: `${Math.round(
      (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
    )}%`,
  }));

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <span className="text-5xl font-bold text-gray-900">
          {avg.toFixed(1)}
        </span>
        <div>
          <StarRating rating={avg} size="md" />
          <p className="text-sm text-gray-500 mt-1">{reviews.length} {t("reviews")}</p>
        </div>
      </div>

      <Separator />

      {/* Bars */}
      {counts.map(({ star, count, width }) => (
        <div key={star} className="flex items-center gap-3">
          <span className="text-sm text-gray-500 w-4">{star}</span>
          <Star className="w-3.5 h-3.5 fill-[#f5c518] text-[#f5c518]" />
          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-[#f5c518] rounded-full transition-all"
              style={{ width }}
            />
          </div>
          <span className="text-xs text-gray-400 w-4">{count}</span>
        </div>
      ))}

      <Separator />

      {/* Review list */}
      <div>
        {reviews.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>
    </div>
  );
}

function CommentCard({ c }: { c: Comment }) {
  const t = useTranslations("ProductDetails.tabs");

  return (
    <div className="py-4 border-b border-gray-100">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{t("user")} #{c.userId}</span>
        <span>{new Date(c.createdAt).toLocaleDateString("vi-VN")}</span>
      </div>
      <p className="text-sm mt-2 text-gray-700">{c.content}</p>
    </div>
  );
}

function CommentSection({
  productId,
  initialComments,
}: {
  productId: string;
  initialComments: Comment[];
}) {
  const t = useTranslations("ProductDetails.tabs");
  const { data: session } = useSession();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) return;

    const newComment = {
      productId: String(productId),
      content,
      createdAt: new Date().toISOString(),
    };

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newComment),
    });

    if (!res.ok) return;

    const saved = await res.json();
    setComments((prev) => [saved, ...prev]);
    setContent("");
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      {!session ? (
        <p className="text-sm text-gray-400">
          {t("loginToAsk")}
        </p>
      ) : (
        <div className="flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập câu hỏi..."
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 rounded text-sm"
        >
          {t("submit")}
        </button>
      </div>
      )}

      {/* List */}
      {comments.length === 0 ? (
        <p className="text-sm text-gray-400">{t("noComments")}</p>
      ) : (
        comments.map((c) => <CommentCard key={c.id} c={c} />)
      )}
    </div>
  );
}

// ProductTabs 

interface ProductTabsProps {
  product: Product;
  reviews: Review[];
  comments: Comment[];
}

export default function ProductTabs({ product, reviews, comments }: ProductTabsProps) {
  const t = useTranslations("ProductDetails.tabs");

  const TAB_LIST = [
    { value: "info", label: t("info") },
    { value: "reviews", label: t("reviews") },
    { value: "comments", label: t("comments") },
  ];

  return (
    <Tabs defaultValue="info">
      <TabsList className="w-full justify-start rounded-none border-b border-gray-200 bg-transparent gap-0 h-auto p-0">
        {TAB_LIST.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="rounded-none uppercase data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-700 data-[state=active]:bg-transparent text-xs font-bold text-gray-500 px-5 py-3 transition-all cursor-pointer"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Info tab */}
      <TabsContent value="info" className="pt-6">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {[
              [t("id"), String(product.id)],
              [t("name"), product.name],
              [t("description"), product.description],
              [t("price"), `${product.price.toLocaleString("vi-VN")}đ`],
              [t("stock_value"), `${product.stock}`],
              [t("category"), `#${product.categoryId}`],
            ].map(([label, value]) => (
              <tr key={label} className="border-b border-gray-100">
                <td className="py-3 pr-4 font-semibold text-gray-700 w-40 align-top">
                  {label}
                </td>
                <td className="py-3 text-gray-600">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TabsContent>

      {/* Reviews tab */}
      <TabsContent value="reviews" className="pt-6">
        <RatingSummary reviews={reviews} />
      </TabsContent>

      {/* Comments tab */}
      <TabsContent value="comments" className="pt-6">
        <CommentSection
          productId={product.id}
          initialComments={comments}
        />
      </TabsContent>
    </Tabs>
  );
}
