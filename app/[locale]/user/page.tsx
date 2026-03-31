'use client'

import { signOut } from "next-auth/react"

export default function UserPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 w-full max-w-[1440px]">
      <h1 className="text-2xl uppercase mb-6">User Page</h1>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="bg-black rounded-none text-white font-normal hover:bg-black/80 uppercase"
      >
        Đăng xuất
      </button>
    </div>
  )
}
