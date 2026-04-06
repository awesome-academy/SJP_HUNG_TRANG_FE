import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const sort = searchParams.get("sort") || "id";
  const order = searchParams.get("order") || "desc";

  const query = new URLSearchParams({
    _page: page,
    _limit: limit,
    _sort: sort,
    _order: order,
  });

  const filters = ["q", "role", "isActive"];
  filters.forEach((key) => {
    const val = searchParams.get(key);
    if (val) query.append(key, val);
  });

  if (searchParams.get("email"))
    query.append("email_like", searchParams.get("email")!);
  if (searchParams.get("fullName"))
    query.append("fullName_like", searchParams.get("fullName")!);

  try {
    const res = await fetch(`${BASE}/users?${query.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return Response.json(
        { message: "Failed to fetch from data source" },
        { status: 500 },
      );
    }

    const rawUsers = await res.json();
    const totalCount = res.headers.get("x-total-count");

    const safeData = rawUsers.map((user: any) => {
      const { password, ...rest } = user;
      return rest;
    });

    return Response.json({
      data: safeData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(totalCount) || safeData.length,
      },
    });
  } catch (error) {
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
