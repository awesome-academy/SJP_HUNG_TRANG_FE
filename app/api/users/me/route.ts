import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { apiGet, apiPut } from "@/lib/json-server"
import type { User } from "@/types/user"


function toProfilePayload(user: User): User {
  return {
    id: String(user.id),
    email: user.email,
    fullName: user.fullName ?? "",
    phone: user.phone ?? "",
    address: user.address ?? "",
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await apiGet<User>(`/users/${session.user.id}`)
    return NextResponse.json(toProfilePayload(user), { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

async function updateProfile(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json()) as {
      fullName?: unknown
      phone?: unknown
      address?: unknown
    }

    if (
      typeof body.fullName !== "string" ||
      typeof body.phone !== "string" ||
      typeof body.address !== "string"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const currentUser = await apiGet<User>(`/users/${session.user.id}`)

    const updatedUser: User = {
      ...currentUser,
      fullName: body.fullName.trim(),
      phone: body.phone.trim(),
      address: body.address.trim(),
    }

    const savedUser = await apiPut<User>(`/users/${session.user.id}`, updatedUser)

    return NextResponse.json(toProfilePayload(savedUser), { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}


export async function PUT(req: NextRequest) {
  return updateProfile(req)
}
