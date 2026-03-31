'use client'

import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react"
import { ROLES } from "@/constants/role"
import { ROUTES } from "@/constants/router"

export default function AdminPage() {
  const { data: session, status } = useSession()

  if (status === "loading") return <p>Loading...</p>

  if (session?.user?.role !== ROLES.ADMIN) {
    return <p>Không có quyền</p>
  }

  return (
    <div className="max-w-3xl mx-auto py-10 w-full max-w-[1440px]">
      <h1 className="text-2xl uppercase mb-6">Admin Page</h1>
      <button
        onClick={() => signOut({ callbackUrl: ROUTES.LOGIN })}
        className="bg-black rounded-none text-white font-normal hover:bg-black/80 uppercase"
      >
        Đăng xuất
      </button>
    </div>
  )
}
