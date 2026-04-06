import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { ROLES } from "@/constants/role";

const BASE = process.env.JSON_SERVER_URL;

if (!BASE) {
  throw new Error("JSON_SERVER_URL environment variable is not configured");
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  const res = await fetch(
    `${BASE}/reviews?userId=${encodeURIComponent(userId)}`,
  );

  if (!res.ok) {
    return Response.json({ error: "Failed" }, { status: 500 });
  }

  const data = await res.json();
  return Response.json(data);
}
