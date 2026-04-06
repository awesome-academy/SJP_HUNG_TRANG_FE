"use client";

import { useRouter } from "@/i18n/navigation";
import { EditForm } from "@/components/admin/products/product-details/EditForm";
import { Product } from "@/types/product";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CreateProductPage() {
  const t = useTranslations("Admin.products");
  const router = useRouter();

  const emptyProduct: Product = {
    id: "",
    name: "",
    description: "",
    price: 0,
    stock: 0,
    categoryId: "",
    images: [],
    variants: [],
  };

  const handleCreate = async (data: Partial<Product>) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/admin/products");
      } else {
        throw new Error();
      }
    } catch (error) {
      console.error("Failed to create product:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 font-medium"
        >
          <ChevronLeft size={18} /> {t("backToList")}
        </button>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wider">
              {t("createProduct")}
            </h1>
          </div>
          <div className="p-6">
            <EditForm
              product={emptyProduct}
              onSave={handleCreate}
              onCancel={() => router.push("/admin/products")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
