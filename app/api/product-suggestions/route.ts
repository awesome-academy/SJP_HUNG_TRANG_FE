import { NextResponse } from "next/server";

import { nextId, readMockDb, writeMockDb } from "@/lib/mock-db";

type SuggestionRequest = {
  productName?: string;
  description?: string;
  photos?: Array<{ url?: string }>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SuggestionRequest;

    const productName = body.productName?.trim();
    const description = body.description?.trim();

    if (!productName || !description) {
      return NextResponse.json(
        { message: "Product name and description are required" },
        { status: 400 }
      );
    }

    const photoUrls = (body.photos ?? [])
      .map((photo) => photo.url?.trim())
      .filter((url): url is string => Boolean(url));

    const db = await readMockDb();
    const suggestions = Array.isArray(db.productSuggestions) ? db.productSuggestions : [];

    const allPhotos = suggestions.flatMap((item) => item.photos ?? []);
    let nextPhotoId = nextId(allPhotos.length ? allPhotos : [{ id: 0 }]);

    const photos = photoUrls.map((url) => {
      const photo = {
        id: nextPhotoId,
        url,
      };
      nextPhotoId += 1;
      return photo;
    });

    const newSuggestion = {
      id: nextId(suggestions),
      productName,
      description,
      photos,
    };

    db.productSuggestions = [...suggestions, newSuggestion];
    await writeMockDb(db);

    return NextResponse.json(newSuggestion, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to create product suggestion" }, { status: 500 });
  }
}
