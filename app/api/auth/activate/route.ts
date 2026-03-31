import { NextResponse } from "next/server"

const BASE_URL = process.env.JSON_SERVER_URL;

if (!BASE_URL) {
  throw new Error("JSON_SERVER_URL environment variable is not set. Please configure it to point to the JSON server base URL.");
}

export async function GET(req: Request) {
  const locale = new URL(req.url).searchParams.get("locale") || "vi"

  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ message: "Thiếu token" }, { status: 400 })
    }

    const res = await fetch(`${BASE_URL}/users?activateToken=${token}`)
    const users = await res.json()

    if (!users.length) {
      return NextResponse.json({ message: "Token không hợp lệ" }, { status: 400 })
    }

    const user = users[0]

    // check expire
    if (Date.now() > user.activateTokenExpires) {
      return NextResponse.json({ message: "Token hết hạn" }, { status: 400 })
    }

    if (user.isActive) {
      return NextResponse.json({ message: "Đã kích hoạt rồi" })
    }

    // activate
    await fetch(`${BASE_URL}/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isActive: true,
        activateToken: null,
        activateTokenExpires: null
      })
    })
    
    return NextResponse.redirect(
       new URL(`/${locale}/login?activated=true`, req.url)
    )

  } catch (error) {
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 })
  }
}
