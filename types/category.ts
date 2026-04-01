export interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
  depth: number;
}
