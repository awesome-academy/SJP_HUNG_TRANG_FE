"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, RefreshCw, Layers, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category, CategoryNode } from "@/types/category";
import { flattenTree } from "@/lib/categoryTree";
import CategoryTree from "@/components/admin/categories/CategoryTree";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import { useTranslations } from "next-intl";


async function fetchTree(): Promise<CategoryNode[]> {
  const res = await fetch("/api/admin/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

async function apiDelete(id: number): Promise<void> {
  const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete category");
}

// Stat card 

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <div>
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

//  Page

type FormState =
  | { mode: "hidden" }
  | { mode: "create"; defaultParentId: number | null }
  | { mode: "edit"; category: Category };

export default function CategoryPage() {
  const t = useTranslations("Admin.categories");
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<FormState>({ mode: "hidden" });
  const [search, setSearch] = useState("");

  //Load tree 

  const isMountedRef = useRef(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTree();
      if (isMountedRef.current) setTree(data);
    } catch (error) {
      console.error("Failed to load category tree", error);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    load();

    return () => {
      isMountedRef.current = false;
    };
  }, [load]);


  const allFlat: Category[] = flattenTree(tree);

  const totalCount = allFlat.length;
  const rootCount = tree.length;
  const maxDepth = allFlat.length > 0
    ? Math.max(...flattenTree(tree).map((n) => n.depth))
    : 0;

  const searchLower = search.trim().toLowerCase();
  const filteredFlat = searchLower
    ? allFlat.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          String(c.id).includes(search.trim())
      )
    : allFlat;

  const displayTree: CategoryNode[] = searchLower
    ? (() => {
        const matchedIds = new Set(filteredFlat.map((c) => c.id));
        // Also include all ancestors of matched nodes
        const withAncestors = new Set<number>(matchedIds);
        const addAncestors = (nodes: CategoryNode[]) => {
          for (const n of nodes) {
            if (matchedIds.has(n.id) && n.parentId !== null) {
              withAncestors.add(n.parentId);
            }
            addAncestors(n.children);
          }
        };
        addAncestors(tree);
        const filterTree = (nodes: CategoryNode[]): CategoryNode[] =>
          nodes
            .filter((n) => withAncestors.has(n.id))
            .map((n) => ({ ...n, children: filterTree(n.children) }));
        return filterTree(tree);
      })()
    : tree;

  const handleFormSuccess = (cat: Category, isNew: boolean) => {
    load();
    setFormState({ mode: "hidden" });
  };

  const handleDelete = async (node: CategoryNode) => {
    const toDelete: number[] = [];
    const collect = (n: CategoryNode) => {
      toDelete.push(n.id);
      n.children.forEach(collect);
    };
    collect(node);

    try {
      await Promise.all(toDelete.map((id) => apiDelete(id)));
      if (formState.mode === "edit" && toDelete.includes(formState.category.id)) {
        setFormState({ mode: "hidden" });
      }
      await load();
    } catch (error) {
      console.error("Xoá thất bại. Vui lòng thử lại.", error);
    }
  };

  const editingCategory = formState.mode === "edit" ? formState.category : null;
  const defaultParentId = formState.mode === "create" ? formState.defaultParentId : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* Page header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-wide">
              {t("title")}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {t("description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={load}
              variant="outline"
              className="flex items-center gap-2 text-sm border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              {t("refresh")}
            </Button>
            <Button
              onClick={() => setFormState({ mode: "create", defaultParentId: null })}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("add_category")}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label={t("total_categories")} value={totalCount} sub={t("all_levels")} />
          <StatCard label={t("root_categories")} value={rootCount} sub={t("top_level")} />
          <StatCard label={t("max_depth")} value={maxDepth + 1} sub={t("levels")} />
        </div>

        {/* Main content: tree + form */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

          {/* Tree panel */}
          <div className={cn(
            "bg-white rounded-lg border border-gray-200 overflow-hidden",
            formState.mode !== "hidden" ? "lg:col-span-3" : "lg:col-span-5"
          )}>
            {/* Tree header */}
            <div className="flex items-center justify-between gap-3 px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-green-600" />
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                  {t("category_tree")}
                </h2>
              </div>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("search_categories")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-b border-gray-100 flex-wrap">
              {[
                { label: t("level_1"), color: "bg-green-500" },
                { label: t("level_2"), color: "bg-blue-400" },
                { label: t("level_3"), color: "bg-violet-400" },
                { label: t("level_4_plus"), color: "bg-amber-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className={cn("w-2.5 h-2.5 rounded-sm flex-shrink-0", item.color)} />
                  <span className="text-xs text-gray-500">{item.label}</span>
                </div>
              ))}
              <span className="text-xs text-gray-400 ml-auto hidden sm:block">
                {t("legend_desc")}
              </span>
            </div>

            {/* Tree body */}
            <div className="p-4">
              {loading ? (
                <div className="py-16 text-center text-sm text-gray-400 flex flex-col items-center gap-3">
                  <RefreshCw className="w-5 h-5 animate-spin text-green-500" />
                  {t("loading_categories")}
                </div>
              ) : (
                <>
                  {searchLower && displayTree.length === 0 && (
                    <p className="py-8 text-center text-sm text-gray-400">
                      {t("no_categories_found")} "{search}"
                    </p>
                  )}
                  <CategoryTree
                    roots={displayTree}
                    onEdit={(node) => setFormState({ mode: "edit", category: node })}
                    onAddChild={(parentId) => setFormState({ mode: "create", defaultParentId: parentId })}
                    onDelete={handleDelete}
                  />
                </>
              )}
            </div>

            {/* Footer */}
            {!loading && totalCount > 0 && (
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-400">
                  {searchLower
                    ? t("summary.filtered", {
                        filtered: filteredFlat.length,
                        total: totalCount,
                      })
                    : t("summary.all", {
                        total: totalCount,
                        root: rootCount,
                        depth: maxDepth + 1,
                      })}
                </p>
              </div>
            )}
          </div>

          {/* Form panel */}
          {formState.mode !== "hidden" && (
            <div className="lg:col-span-2">
              <CategoryForm
                editing={editingCategory}
                tree={tree}
                allCategories={allFlat}
                defaultParentId={defaultParentId}
                onSuccess={handleFormSuccess}
                onCancel={() => setFormState({ mode: "hidden" })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
