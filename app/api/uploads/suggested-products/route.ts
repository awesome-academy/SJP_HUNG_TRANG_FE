import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

const uploadFolder = path.join(process.cwd(), "public", "images", "suggested-products");

const mimeToExtension: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

function sanitizeBaseName(name: string): string {
  const baseName = name.replace(/\.[^/.]+$/, "");
  const normalized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "image";
}

function detectExtension(file: File): string {
  const extFromName = path.extname(file.name).toLowerCase();
  if (extFromName) {
    return extFromName;
  }

  return mimeToExtension[file.type] ?? ".jpg";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("photos").filter((item) => item instanceof File) as File[];

    if (!files.length) {
      return NextResponse.json({ message: "No files uploaded" }, { status: 400 });
    }

    await mkdir(uploadFolder, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ message: "Only image files are allowed" }, { status: 400 });
      }

      const extension = detectExtension(file);
      const safeBaseName = sanitizeBaseName(file.name);
      const filename = `${Date.now()}-${randomUUID()}-${safeBaseName}${extension}`;
      const filePath = path.join(uploadFolder, filename);

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      urls.push(`/images/suggested-products/${filename}`);
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to upload images" }, { status: 500 });
  }
}
