"use client";

import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import type { Category } from "@/lib/mock-db";
import { cn } from "@/lib/utils";

type CategoryTreeFilterProps = {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  locale: "vi" | "en";
};

export default function CategoryTreeFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
  locale,
}: CategoryTreeFilterProps) {
  const t = useTranslations("ProductsPage.filters");
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<number>>(new Set());

  const { rootCategories, childrenByParentId } = useMemo(() => {
    const root = categories.filter((category) => category.parentId === null);
    const childrenMap = new Map<number, Category[]>();

    categories.forEach((category) => {
      if (category.parentId === null) {
        return;
      }

      const currentChildren = childrenMap.get(category.parentId) ?? [];
      currentChildren.push(category);
      childrenMap.set(category.parentId, currentChildren);
    });

    const sortLocale = locale === "en" ? "en" : "vi";

    root.sort((a, b) => a.name.localeCompare(b.name, sortLocale));
    childrenMap.forEach((children) => {
      children.sort((a, b) => a.name.localeCompare(b.name, sortLocale));
    });

    return { rootCategories: root, childrenByParentId: childrenMap };
  }, [categories, locale]);

  const toggleExpanded = (categoryId: number) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const renderCategoryNode = (category: Category, depth: number) => {
    const children = childrenByParentId.get(category.id) ?? [];
    const isExpanded = expandedCategoryIds.has(category.id);
    const hasChildren = children.length > 0;

    return (
      <li key={category.id} className="border-b border-zinc-100 last:border-b-0">
        <div className="flex items-center justify-between px-3 py-2" style={{ paddingLeft: `${12 + depth * 16}px` }}>
          <button
            type="button"
            onClick={() => {
              if (!hasChildren) {
                onSelectCategory(category.id);
                return;
              }
              if (!isExpanded) {
                toggleExpanded(category.id);
              }
              onSelectCategory(category.id);
                return;
            }}
            className={cn(
              "text-left text-[15px]",
              depth === 0 ? "font-semibold" : "font-normal",
              selectedCategoryId === category.id ? "text-[#7faa3d]" : "text-zinc-700"
            )}
          >
            {depth > 0 ? `${category.name}` : category.name}
          </button>

          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpanded(category.id)}
              className="text-zinc-500 hover:text-zinc-700"
              aria-label={t("toggle", { name: category.name })}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : null}
        </div>

        {hasChildren && isExpanded ? <ul>{children.map((child) => renderCategoryNode(child, depth + 1))}</ul> : null}
      </li>
    );
  };

  return (
    <aside className="w-full rounded-md border border-zinc-200 bg-white text-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-3 py-3">
        <Menu className="h-4 w-4" />
        <h2 className="text-sm font-bold uppercase tracking-wide">{t("title")}</h2>
      </div>

      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        className={cn(
          "w-full border-b border-zinc-100 px-3 py-2 text-left text-base font-semibold",
          selectedCategoryId === null ? "text-[#7faa3d]" : "text-zinc-700 hover:bg-zinc-50"
        )}
      >
        {t("all")}
      </button>

      <ul>{rootCategories.map((rootCategory) => renderCategoryNode(rootCategory, 0))}</ul>
    </aside>
  );
}
