import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type EmailSubscription = {
  id: number;
  email: string;
};

export type SuggestionPhoto = {
  id: number;
  url: string;
};

export type ProductSuggestion = {
  id: number;
  productName: string;
  description: string;
  photos: SuggestionPhoto[];
};

type MockDb = {
  emailSubscriptions?: EmailSubscription[];
  productSuggestions?: ProductSuggestion[];
  [key: string]: unknown;
};

const dbPath = path.join(process.cwd(), "db.json");

export async function readMockDb(): Promise<MockDb> {
  const raw = await readFile(dbPath, "utf-8");
  return JSON.parse(raw) as MockDb;
}

export async function writeMockDb(db: MockDb): Promise<void> {
  await writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");
}

export function nextId(items: Array<{ id: number }>): number {
  if (!items.length) {
    return 1;
  }

  return Math.max(...items.map((item) => item.id)) + 1;
}
