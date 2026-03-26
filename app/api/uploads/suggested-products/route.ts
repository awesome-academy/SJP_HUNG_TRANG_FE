import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getTranslations } from "next-intl/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const entries = formData.getAll("photos");
  const t = await getTranslations("Upload");
  const files: File[] = [];
  for (const entry of entries) {
    if (!(entry instanceof File)) {
      return NextResponse.json(
        { error: t("invalidUploadPayload") },
        { status: 400 },
      );
    }
    files.push(entry);
  }
  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_MIME_TYPES = new Set<string>([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: t("tooManyFiles") },
      { status: 400 },
    );
  }
  const uploadDir = path.join(process.cwd(), "public/uploads/suggested-products");
  await mkdir(uploadDir, { recursive: true });
  const urls: string[] = [];
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: t("fileTooLarge", { filename: file.name, maxSize: MAX_FILE_SIZE }),
        },
        { status: 400 },
      );
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: t("unsupportedFileType", { filename: file.name }),
        },
        { status: 400 },
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    await writeFile(path.join(uploadDir, filename), buffer);
    urls.push(`/uploads/suggested-products/${filename}`);
  }

  return NextResponse.json({ urls });
}
