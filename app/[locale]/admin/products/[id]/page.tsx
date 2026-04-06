"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  PackageOpen,
  RefreshCw,
  Pencil,
  ImageIcon,
  Tag,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard, InfoRow } from "@/components/admin/products/ui";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { EditForm } from "@/components/admin/products/product-details/EditForm";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { formatPriceVnd } from "@/lib/mock-db";


function StockBadge({ stock }: { stock: number }) {
  const t = useTranslations("Admin.product_details");
  if (stock === 0)
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
        {t("outOfStock")}
      </span>
    );
  if (stock <= 5)
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-600">
        {t("lowStock")}
      </span>
    );
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
      {t("inStock")}
    </span>
  );
}

// Gallery
function ImageGallery({ product }: { product: Product }) {
  const t = useTranslations("Admin.product_details");
  const [selected, setSelected] = useState(0);
  const images = product.images ?? [];

  if (images.length === 0)
    return (
      <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm italic">
        {t("noImages")}
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square rounded-lg border border-gray-100 overflow-hidden bg-white flex items-center justify-center">
        <Image
          src={images[selected]?.url}
          alt={product.name}
          fill
          className="w-full h-full object-contain p-2"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setSelected(i)}
            className={cn(
              "relative w-14 h-14 rounded-lg border-2 overflow-hidden flex-shrink-0",
              selected === i ? "border-green-500" : "border-gray-200",
            )}
          >
            <Image
              src={img.url}
              alt=""
              fill
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// Product Detail
export default function ProductDetailPage() {
  const t = useTranslations("Admin.product_details");
  const locale = useLocale();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const params = useParams();
  const id = params.id as string;

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/products/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProduct(data);
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleSave = async (data: Partial<Product>) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setProduct(updated);
        setEditing(false);
      }
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-gray-400 font-medium">
        {t("loading")}
      </div>
    );
  if (!product)
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        {t("notFound")}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <SectionCard
              title={t("images")}
              icon={<ImageIcon className="w-4 h-4" />}
            >
              <ImageGallery product={product} />
            </SectionCard>

            <div className="bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  {product.stock}
                </p>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                  {t("stock")}
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  #{product.categoryId}
                </p>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                  {t("category")}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setEditing(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-6"
            >
              <Pencil className="w-4 h-4 mr-2" /> {t("editProduct")}
            </Button>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {editing ? (
              <SectionCard
                title={t("edit_form_title")}
                icon={<Pencil className="w-4 h-4" />}
              >
                <EditForm
                  product={product}
                  onSave={handleSave}
                  onCancel={() => setEditing(false)}
                />
              </SectionCard>
            ) : (
              <SectionCard
                title={t("details")}
                icon={<Tag className="w-4 h-4" />}
              >
                <InfoRow icon={<Tag className="w-4 h-4" />} label={t("name")}>
                  <span className="font-bold text-gray-800">
                    {product.name}
                  </span>
                </InfoRow>
                <InfoRow
                  icon={<PackageOpen className="w-4 h-4" />}
                  label={t("description")}
                >
                  <span className="text-sm text-gray-600">
                    {product.description}
                  </span>
                </InfoRow>
                <InfoRow
                  icon={<RefreshCw className="w-4 h-4" />}
                  label={t("basePrice")}
                >
                  <span className="text-lg font-extrabold text-green-600">
                    {formatPriceVnd(product.price, locale)}
                  </span>
                </InfoRow>
              </SectionCard>
            )}

            {/* Variants */}
            {!editing && product.variants && product.variants.length > 0 && (
              <SectionCard
                title={t("variants")}
                icon={<Layers className="w-4 h-4" />}
              >
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3">{t("color")}</th>
                        <th className="px-4 py-3">{t("size")}</th>
                        <th className="px-4 py-3 text-right">{t("stock")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {product.variants.map((v) => (
                        <tr
                          key={v.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium">{v.color}</td>
                          <td className="px-4 py-3 text-xs uppercase">
                            {v.size}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <StockBadge stock={v.stock} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
