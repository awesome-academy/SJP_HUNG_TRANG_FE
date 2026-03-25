import { NextResponse } from "next/server"
import { transporter } from "@/lib/mail"
import { ROLES } from "@/constants/role";
import { getActivateEmailTemplate } from "@/lib/emailTemplates"

const BASE_URL = process.env.JSON_SERVER_URL;

if (!BASE_URL) {
  throw new Error("JSON_SERVER_URL environment variable is not set. Please configure it to point to the JSON server base URL.");
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      subscribe,
      locale = "vi" 
    } = body

    // validate
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json({ message: "Thiếu thông tin bắt buộc" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ message: "Mật khẩu không khớp" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Mật khẩu phải >= 6 ký tự" }, { status: 400 })
    }

    const checkRes = await fetch(`${BASE_URL}/users?email=${email}`)
    const existingUsers = await checkRes.json()

    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "Email đã tồn tại" }, { status: 400 })
    }

    const activateToken = crypto.randomUUID()

    const newUser = {
      email,
      password,
      fullName: `${firstName} ${lastName}`,
      role: ROLES.USER,
      isActive: false,
      activateToken,
      activateTokenExpires: Date.now() + 1000 * 60 * 60, // 1h
      createdAt: new Date().toISOString(),
      subscribe: subscribe || false
    }

    const createRes = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    })

    const activateLink = `${process.env.NEXTAUTH_URL}/api/auth/activate?token=${activateToken}`

    const { subject, html } = getActivateEmailTemplate({
      firstName,
      activateLink,
      locale
    })

    await transporter.sendMail({
      from: '"My Ecommerce App" <no-reply@test.com>',
      to: email,
      subject,
      html
    })

    // newsletter
    if (subscribe) {
      await fetch(`${BASE_URL}/emailSubscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
    }

    return NextResponse.json({
      message: "Đăng ký thành công, hãy mở email để kích hoạt"
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 })
  }
}
