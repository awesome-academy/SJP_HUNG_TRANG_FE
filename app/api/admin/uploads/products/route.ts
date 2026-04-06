import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ROLES } from "@/constants/role";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const entries = formData.getAll("photos");
  const files: File[] = [];
  for (const entry of entries) {
    if (!(entry instanceof File)) {
      return NextResponse.json(
        { error: "Invalid upload payload" },
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
      { error: "Too many files uploaded" },
      { status: 400 },
    );
  }
  const uploadDir = path.join(process.cwd(), "public/uploads/products");
  await mkdir(uploadDir, { recursive: true });
  const urls: string[] = [];
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "File too large: " +
            file.name +
            " (Max: " +
            MAX_FILE_SIZE +
            " bytes)",
        },
        { status: 400 },
      );
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: "Unsupported file type: " + file.type,
        },
        { status: 400 },
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeFileName = path.basename(file.name);
    const filename = `${Date.now()}-${safeFileName}`;
    await writeFile(path.join(uploadDir, filename), buffer);
    urls.push(`/uploads/products/${filename}`);
  }

  return NextResponse.json({ urls });
}
