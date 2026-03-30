import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("photos") as File[];

  const uploadDir = path.join(process.cwd(), "public/uploads/suggested-products");
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    await writeFile(path.join(uploadDir, filename), buffer);
    urls.push(`/uploads/suggested-products/${filename}`);
  }

  return NextResponse.json({ urls });
}
