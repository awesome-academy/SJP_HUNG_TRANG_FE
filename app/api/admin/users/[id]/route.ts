import { ROLES } from "@/constants/role";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const BASE = process.env.JSON_SERVER_URL;

// GET user detail
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const res = await fetch(`${BASE}/users/${id}`);

  if (!res.ok) {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  const user = await res.json();
  const { password, ...safeUser } = user;
  return Response.json(safeUser);
}

// UPDATE user
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
  const { id } = await params;
  const body = await req.json();

  const res = await fetch(`${BASE}/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return Response.json({ message: "Update failed" }, { status: 500 });
  }

  return Response.json(await res.json());
}

// DELETE user
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const res = await fetch(`${BASE}/users/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    return Response.json({ message: "Delete failed" }, { status: 500 });
  }

  return Response.json({ success: true });
}
