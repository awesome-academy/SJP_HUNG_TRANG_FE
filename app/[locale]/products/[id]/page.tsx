import { notFound } from "next/navigation";
import ProductGallery from "@/components/product_details/ProductGallery";
import ProductInfo from "@/components/product_details/ProductInfo";
import ProductTabs from "@/components/product_details/ProductTabs";
import ProductSidebar from "@/components/product_details/ProductSidebar";
import { apiGet } from "@/lib/json-server";
import { Product } from "@/types/product";
import { Review } from "@/types/review";
import { Comment } from "@/types/comment";

type ProductDetailPageProps = {
  params: Promise<{ id: string; locale: "vi" | "en" }>;
};

async function getProduct(id: string): Promise<Product> {
  try {
    const res =  await apiGet<Product>(`/products/${id}`, { cache: "no-store" });
    if (!res) notFound();
    return res;
  } catch (err: any) {
    if (err.status === 404) notFound();
    throw err;
  }
}

async function getReviews(productId: string): Promise<Review[]> {
  try {
      const res = await apiGet<Review[]>(`/reviews?productId=${productId}`, { cache: "no-store" });
      if (!res) notFound();
      return res;
  } catch (err: any) {
    if (err.status === 404) notFound();
    throw err;
  }
}

async function getComments(productId: string): Promise<Comment[]> {
  try {
    const res = await apiGet<Comment[]>(`/comments?productId=${productId}`, { cache: "no-store" });
    if (!res) notFound();
    return res;
  } catch (err: any) {
    if (err.status === 404) notFound();
    throw err;
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id, locale } = await params;

  const [product, reviews, comments] = await Promise.all([
    getProduct(id),
    getReviews(id),
    getComments(id),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Gallery + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <ProductGallery product={product} />
          <ProductInfo product={product} locale={locale} />
        </div>

        {/* Tabs + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ProductTabs product={product} reviews={reviews}  comments={comments}/>
          </div>
          <ProductSidebar />
        </div>
      </div>
    </div>
  );
}
