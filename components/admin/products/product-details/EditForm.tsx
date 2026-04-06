import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { Product, ProductImage, Variant } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors";

export function EditForm({
  product,
  onSave,
  onCancel,
}: {
  product: Product;
  onSave: (data: Partial<Product>) => Promise<void>;
  onCancel: () => void;
}) {
  const t = useTranslations("Admin.product_details.edit_form");
  const [form, setForm] = useState({
    name: product.name,
    description: product.description,
    price: String(product.price),
    stock: String(product.stock),
    categoryId: product.categoryId ?? "",
    variants: product.variants || [],
    images: product.images || [],
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("photos", file));

    setUploading(true);
    try {
      const res = await fetch("/api/admin/uploads/products", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        const newImages: ProductImage[] = data.urls.map(
          (url: string, index: number) => ({
            id: (Date.now() + index).toString(),
            url: url,
            isMain: form.images.length === 0 && index === 0,
            sortOrder: form.images.length + index + 1,
          }),
        );

        setForm((prev) => ({
          ...prev,
          images: [...prev.images, ...newImages],
        }));
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);

      const hasMain = newImages.some((img) => img.isMain);

      if (newImages.length > 0 && !hasMain) {
        newImages[0] = { ...newImages[0], isMain: true };
      }

      return {
        ...prev,
        images: newImages,
      };
    });
  };

  const setMainImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({ ...img, isMain: i === index })),
    }));
  };

  const updateVariant = (index: number, key: keyof Variant, value: any) => {
    const newVariants = [...form.variants];
    newVariants[index] = { ...newVariants[index], [key]: value };
    setForm({ ...form, variants: newVariants });
  };

  const addVariant = () => {
    const lastId =
      form.variants.length > 0
        ? Math.max(...form.variants.map((v) => Number(v.id)))
        : 0;

    const newId = String(lastId + 1);

    const newVariant: Variant = {
      id: newId,
      color: "",
      size: "",
      stock: 0,
    };

    setForm({ ...form, variants: [...form.variants, newVariant] });
  };

  const removeVariant = (index: number) => {
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: form.categoryId,
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (form.variants.length > 0) {
      const totalStock = form.variants.reduce(
        (sum, v) => sum + (Number(v.stock) || 0),
        0,
      );
      setForm((prev) => ({ ...prev, stock: String(totalStock) }));
    }
  }, [form.variants]);

  return (
    <div className="space-y-4">
      {/* Image upload */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          {t("images")}
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {form.images.map((img, i) => (
            <div
              key={i}
              className={cn(
                "relative aspect-square rounded-lg border-2 overflow-hidden group",
                img.isMain ? "border-green-500" : "border-gray-200",
              )}
            >
              <Image
                src={img.url}
                alt="product"
                fill
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.isMain && (
                  <button
                    onClick={() => setMainImage(i)}
                    className="p-1 bg-white rounded text-[10px] font-bold text-gray-700"
                  >
                    {t("setMainImage")}
                  </button>
                )}
                <button
                  onClick={() => removeImage(i)}
                  className="p-1 bg-red-500 rounded text-white"
                >
                  <X size={14} />
                </button>
              </div>
              {img.isMain && (
                <div className="absolute top-0 left-0 bg-green-500 text-white text-[9px] px-1.5 py-0.5 font-bold uppercase">
                  {t("mainImage")}
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-green-400 hover:text-green-600 transition-all"
          >
            {uploading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ImagePlus size={24} />
            )}
            <span className="text-[10px] mt-1 font-bold">{t("addImage")}</span>
          </button>
          <input
            type="file"
            multiple
            hidden
            ref={fileInputRef}
            onChange={handleUploadImages}
            accept="image/*"
          />
        </div>
      </div>

      <Separator />
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
          {t("name")}
        </label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
          {t("description")}
        </label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={cn(inputClass, "resize-none")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
            {t("price")}
          </label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
            {t("stock")}
          </label>
          <input
            type="number"
            value={form.stock}
            readOnly={form.variants.length > 0}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <Separator />

      {/* Variants */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            {t("variants")}
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariant}
            className="h-8 text-xs border-green-200 text-green-600"
          >
            {t("addVariant")}
          </Button>
        </div>

        <div className="space-y-3">
          {form.variants.map((v, i) => (
            <div
              key={v.id}
              className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-lg border border-gray-100"
            >
              <div className="col-span-4 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">
                  {t("color")}
                </span>
                <input
                  value={v.color}
                  onChange={(e) => updateVariant(i, "color", e.target.value)}
                  placeholder={t("colorPlaceholder")}
                  className={inputClass}
                />
              </div>
              <div className="col-span-3 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">
                  {t("size")}
                </span>
                <input
                  value={v.size}
                  onChange={(e) => updateVariant(i, "size", e.target.value)}
                  placeholder={t("sizePlaceholder")}
                  className={inputClass}
                />
              </div>
              <div className="col-span-3 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">
                  {t("stock")}
                </span>
                <input
                  type="number"
                  value={v.stock}
                  onChange={(e) =>
                    updateVariant(i, "stock", Number(e.target.value))
                  }
                  className={inputClass}
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  onClick={() => removeVariant(i)}
                  className="p-2.5 text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {form.variants.length === 0 && (
            <p className="text-xs text-center text-gray-400 py-4 italic">
              {t("noVariants")}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium"
        >
          {t("cancel")}
        </button>
        <Button
          onClick={handleSave}
          disabled={saving || uploading}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          {saving ? <Loader2 className="animate-spin mr-2" /> : null}
          {saving ? t("saving") : t("saveChanges")}
        </Button>
      </div>
    </div>
  );
}
