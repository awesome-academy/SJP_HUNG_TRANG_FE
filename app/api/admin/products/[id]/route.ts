import { ROLES } from "@/constants/role";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const BASE = process.env.JSON_SERVER_URL;

if (!BASE) {
  throw new Error("JSON_SERVER_URL environment variable is not configured");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const res = await fetch(`${BASE}/products/${id}`);

    if (res.status === 404) {
      return Response.json({ message: "Product not found" }, { status: 404 });
    }

    if (!res.ok) {
      return Response.json(
        { message: "Failed to fetch product" },
        { status: 500 },
      );
    }

    const p = await res.json();

    const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;

    const stock = hasVariants
      ? p.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
      : p.stock ?? 0;

    const mainImage =
      p.images?.find((i: any) => i.isMain) || p.images?.[0] || null;

    const product = {
      ...p,
      stock,
      hasVariants,
      mainImage,
    };

    return Response.json(product);
  } catch (error) {
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();

    const { id } = await params;
    const res = await fetch(`${BASE}/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return Response.json(
        { message: "Failed to update product" },
        { status: 500 },
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const res = await fetch(`${BASE}/products/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      return Response.json(
        { message: "Failed to delete product" },
        { status: 500 },
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
