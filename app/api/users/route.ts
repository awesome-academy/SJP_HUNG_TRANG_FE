const BASE = process.env.JSON_SERVER_URL;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const q = searchParams.get("q") || "";
  const email = searchParams.get("email") || "";
  const fullName = searchParams.get("fullName") || "";
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";

  const query = new URLSearchParams({
    _page: page,
    _limit: limit,
    _sort: sort,
    _order: order,
  });

  if (q) query.append("q", q);
  if (email) query.append("email_like", email);
  if (fullName) query.append("fullName_like", fullName);
  if (searchParams.get("role")) {
    query.append("role", searchParams.get("role")!);
    }

    if (searchParams.get("isActive")) {
    query.append("isActive", searchParams.get("isActive")!);
    }

  const res = await fetch(`${BASE}/users?${query.toString()}`);

  if (!res.ok) {
    return Response.json({ message: "Failed" }, { status: 500 });
  }

  const data = await res.json();
  const total = res.headers.get("x-total-count");

  return Response.json({
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: Number(total),
    },
    
  });
}
