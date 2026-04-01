"use client";

import { useState, useEffect } from "react";
import { X, Save, RefreshCw, FolderPlus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category, CategoryNode } from "@/types/category";
import { flattenTree } from "@/lib/categoryTree";
import { useTranslations } from "next-intl";

async function apiCreate(data: Omit<Category, "id">): Promise<Category> {
  const res = await fetch("/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create category");
  return res.json();
}

async function apiUpdate(
  id: number,
  data: Partial<Omit<Category, "id">>,
): Promise<Category> {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update category");
  return res.json();
}

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors";

const errorInputClass =
  "border-red-400 focus:border-red-400 focus:ring-red-400";

function FormField({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// Breadcrumb preview

function ParentBreadcrumb({
  parentId,
  allCategories,
}: {
  parentId: number | null;
  allCategories: Category[];
}) {
  if (parentId === null) return null;

  const chain: string[] = [];
  let current = allCategories.find((c) => c.id === parentId);
  while (current) {
    chain.unshift(current.name);
    current =
      current.parentId !== null
        ? allCategories.find((c) => c.id === current!.parentId)
        : undefined;
  }

  return (
    <div className="flex items-center gap-1 flex-wrap mt-1">
      {chain.map((name, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
            {name}
          </span>
        </span>
      ))}
    </div>
  );
}

// CategoryForm

interface CategoryFormProps {
  editing: Category | null;
  tree: CategoryNode[];
  allCategories: Category[];
  defaultParentId?: number | null;
  onSuccess: (cat: Category, isNew: boolean) => void;
  onCancel: () => void;
}

export default function CategoryForm({
  editing,
  tree,
  allCategories,
  defaultParentId,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const t = useTranslations("Admin.categories.form");
  const isEdit = editing !== null;

  const [name, setName] = useState(editing?.name ?? "");
  const [parentId, setParentId] = useState<number | null>(
    editing?.parentId ?? defaultParentId ?? null,
  );
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(editing?.name ?? "");
    setParentId(editing?.parentId ?? defaultParentId ?? null);
    setErrors({});
  }, [editing, defaultParentId]);

  const availableParents = flattenTree(tree, editing?.id ?? undefined);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = t("validation.name.required");
    else if (name.trim().length < 2) e.name = t("validation.name.minLength");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      let result: Category;
      if (isEdit && editing) {
        result = await apiUpdate(editing.id, { name: name.trim(), parentId });
      } else {
        result = await apiCreate({ name: name.trim(), parentId });
      }
      onSuccess(result, !isEdit);
    } catch {
      setErrors({ name: t("validation.save.failed") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <FolderPlus className="w-4 h-4 text-green-600" />
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            {isEdit ? t("edit_category") : t("add_category")}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Name */}
        <FormField label={t("name")} required error={errors.name}>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors({});
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={t("placeholder")}
            autoFocus
            className={cn(inputClass, errors.name && errorInputClass)}
          />
        </FormField>

        {/* Parent selector */}
        <FormField label={t("parent")} hint={t("parent_hint")}>
          <select
            value={parentId ?? ""}
            onChange={(e) =>
              setParentId(e.target.value === "" ? null : Number(e.target.value))
            }
            className={inputClass}
          >
            <option value="">— {t("root_category")} —</option>
            {availableParents.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {"　".repeat(cat.depth)}
                {cat.depth > 0 ? "└ " : ""}
                {cat.name}
              </option>
            ))}
          </select>
          <ParentBreadcrumb parentId={parentId} allCategories={allCategories} />
        </FormField>

        {/* Path preview */}
        {name.trim() && (
          <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-widest mb-1">
              {t("path_preview")}
            </p>
            <div className="flex items-center gap-1 flex-wrap">
              {parentId !== null && (
                <>
                  <ParentBreadcrumb
                    parentId={parentId}
                    allCategories={allCategories}
                  />
                  <ChevronRight className="w-3 h-3 text-green-400" />
                </>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-600 text-white font-bold">
                {name.trim()}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> {t("cancel")}
          </button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold h-10 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving
              ? t("saving")
              : isEdit
                ? t("save_changes")
                : t("add_category")}
          </Button>
        </div>
      </div>
    </div>
  );
}
