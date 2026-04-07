"use client";

import { useState, useMemo, memo } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Pencil,
  Trash2,
  Plus,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryNode } from "@/types/category";
import { useTranslations } from "next-intl";

const DEPTH_COLORS = [
  "border-l-green-500",
  "border-l-blue-400",
  "border-l-violet-400",
  "border-l-amber-400",
] as const;

const DEPTH_BG = [
  "hover:bg-green-50/60",
  "hover:bg-blue-50/60",
  "hover:bg-violet-50/60",
  "hover:bg-amber-50/60",
] as const;

const DEPTH_ICON = [
  "text-green-600",
  "text-blue-500",
  "text-violet-500",
  "text-amber-500",
] as const;

const DEPTH_BADGE = [
  "bg-green-100 text-green-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
] as const;

function depthColor<T extends readonly string[]>(
  arr: T,
  depth: number,
): T[number] {
  return arr[Math.min(depth, arr.length - 1)];
}

// Confirm inline delete
function DeleteConfirmRow({
  name,
  childCount,
  onConfirm,
  onCancel,
}: {
  name: string;
  childCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("Admin.categories.tree");
  return (
    <div className="mx-3 mb-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm flex items-center gap-3 flex-wrap">
      <p className="flex-1 text-red-700">
        {childCount > 0
          ? t("delete_confirm_full", { name, count: childCount })
          : t("delete_confirm_no_child", { name })}
      </p>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded border border-gray-200 text-xs font-medium text-gray-600 hover:bg-white transition-colors"
        >
          {t("cancel")}
        </button>
        <button
          onClick={onConfirm}
          className="px-3 py-1.5 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
        >
          {t("confirm_delete")}
        </button>
      </div>
    </div>
  );
}

// Single tree node
interface TreeNodeProps {
  node: CategoryNode;
  descendantCounts: Map<number, number>;
  onEdit: (node: CategoryNode) => void;
  onAddChild: (parentId: number) => void;
  onDelete: (node: CategoryNode) => void;
  defaultExpanded?: boolean;
}

const TreeNode = memo(function TreeNode({
  node,
  descendantCounts,
  onEdit,
  onAddChild,
  onDelete,
  defaultExpanded = true,
}: TreeNodeProps) {
  const t = useTranslations("Admin.categories.tree");
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [confirming, setConfirming] = useState(false);

  const hasChildren = node.children && node.children.length > 0;
  const descendantCount = descendantCounts.get(node.id) || 0;

  const iconColor = depthColor(DEPTH_ICON, node.depth);
  const borderColor = depthColor(DEPTH_COLORS, node.depth);
  const bgHover = depthColor(DEPTH_BG, node.depth);
  const badgeColor = depthColor(DEPTH_BADGE, node.depth);

  return (
    <div
      className={cn(
        "border-l-2",
        node.depth > 0 ? `ml-3 ${borderColor}` : "border-l-transparent",
      )}
    >
      {/* Row */}
      <div
        className={cn(
          "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all select-none",
          bgHover,
        )}
      >
        {/* Expand toggle */}
        <button
          disabled={!hasChildren}
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex-shrink-0 w-5 h-5 flex items-center justify-center rounded transition-colors",
            hasChildren
              ? "text-gray-400 hover:text-gray-700"
              : "text-transparent cursor-default",
          )}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )
          ) : null}
        </button>

        {/* Folder icon */}
        <span className={cn("flex-shrink-0 w-4 h-4", iconColor)}>
          {expanded && hasChildren ? (
            <FolderOpen className="w-4 h-4" />
          ) : (
            <Folder className="w-4 h-4" />
          )}
        </span>

        {/* Name */}
        <span
          className="flex-1 text-sm font-semibold text-gray-800 truncate"
          onClick={() => hasChildren && setExpanded(!expanded)}
        >
          {node.name}
        </span>

        {/* ID badge */}
        <span
          className={cn(
            "flex-shrink-0 text-xs px-1.5 py-0.5 rounded font-mono",
            badgeColor,
          )}
        >
          #{node.id}
        </span>

        {/* Children count */}
        {hasChildren && (
          <span className="flex-shrink-0 text-xs text-gray-400 font-medium hidden sm:block">
            {descendantCount} {t("children")}
          </span>
        )}

        {/* Actions — shown on hover */}
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(node.id);
            }}
            title={t("actions.addChild")}
            className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            title={t("actions.edit")}
            className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirming(true);
            }}
            title={t("actions.delete")}
            className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inline delete confirm */}
      {confirming && (
        <DeleteConfirmRow
          name={node.name}
          childCount={descendantCount}
          onConfirm={() => {
            setConfirming(false);
            onDelete(node);
          }}
          onCancel={() => setConfirming(false)}
        />
      )}

      {/* Children */}
      {expanded && hasChildren && (
        <div className="pl-3 space-y-0.5 mt-0.5">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              descendantCounts={descendantCounts}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
              defaultExpanded={child.depth < 2}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// CategoryTree
interface CategoryTreeProps {
  roots: CategoryNode[];
  onEdit: (node: CategoryNode) => void;
  onAddChild: (parentId: number) => void;
  onDelete: (node: CategoryNode) => void;
}

export default function CategoryTree({
  roots,
  onEdit,
  onAddChild,
  onDelete,
}: CategoryTreeProps) {
  const t = useTranslations("Admin.categories.tree");

  const descendantCounts = useMemo(() => {
    const counts = new Map<number, number>();

    const calculateCount = (node: CategoryNode): number => {
      let count = 0;
      if (node.children && node.children.length > 0) {
        count += node.children.length; // Cộng số lượng con trực tiếp
        for (const child of node.children) {
          count += calculateCount(child); // Cộng dồn con của con (cháu)
        }
      }
      counts.set(node.id, count);
      return count;
    };

    roots.forEach(calculateCount);
    return counts;
  }, [roots]);

  if (!roots || roots.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-gray-400 flex flex-col items-center gap-3">
        <Tag className="w-8 h-8 text-gray-200" />
        <p>{t("no_categories_found")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {roots.map((root) => (
        <TreeNode
          key={root.id}
          node={root}
          descendantCounts={descendantCounts}
          onEdit={onEdit}
          onAddChild={onAddChild}
          onDelete={onDelete}
          defaultExpanded
        />
      ))}
    </div>
  );
}
