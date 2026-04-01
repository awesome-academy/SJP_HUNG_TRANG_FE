import type { Category, CategoryNode } from "@/types/category";

export function buildTree(categories: Category[]): CategoryNode[] {
  const map = new Map<number, CategoryNode>();
  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [], depth: 0 });
  }

  const roots: CategoryNode[] = [];
  for (const node of map.values()) {
    if (node.parentId === null) {
      roots.push(node);
    } else {
      const parent = map.get(node.parentId);
      if (parent) parent.children.push(node);
    }
  }

  const setDepth = (nodes: CategoryNode[], depth: number) => {
    for (const n of nodes) {
      n.depth = depth;
      setDepth(n.children, depth + 1);
    }
  };
  setDepth(roots, 0);
  return roots;
}

export function flattenTree(nodes: CategoryNode[], excludeId?: number): CategoryNode[] {
  const result: CategoryNode[] = [];
  const collect = (list: CategoryNode[]) => {
    for (const n of list) {
      if (n.id === excludeId) continue;
      result.push(n);
      collect(n.children);
    }
  };
  collect(nodes);
  return result;
}

export function countDescendants(node: CategoryNode): number {
  return node.children.reduce(
    (sum, child) => sum + 1 + countDescendants(child),
    0
  );
}
