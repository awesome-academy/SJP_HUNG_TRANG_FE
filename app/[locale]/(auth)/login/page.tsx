'use client'

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ROUTES } from "@/constants/router"

export default function LoginPage() {
  const t = useTranslations("Auth.login")
  const locale = useLocale()

  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)

    const callbackUrl = searchParams.get("callbackUrl") || ROUTES.HOME

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.ok) {
      const cleanPath = callbackUrl.replace(new RegExp(`^/${locale}`), "") || ROUTES.HOME;
    
      router.push(cleanPath);
      toast.success(t("success"))
    }
  }

  return (
    <div className="max-w-[1440px] px-12 mx-auto py-10 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl uppercase">{t("title")}</h1>
        <Button
          onClick={() => router.push(ROUTES.REGISTER)}
          className="bg-black rounded-none text-white font-normal hover:bg-black/80 uppercase cursor-pointer"
        >
          {t("register")}
        </Button>
      </div>

      <div className="bg-gray-100 p-6 space-y-6">
        <div className="font-medium space-y-4 max-w-1/2">
          <div>
            <Label>{t("email")} *</Label>
            <Input
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label>{t("password")} *</Label>
            <Input
              disabled={loading}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleLogin}
          disabled={loading}
          className="bg-black rounded-none text-white uppercase mt-4 cursor-pointer"
        >
          {loading ? t("loading") : t("login")}
        </Button>
      </div>
    </div>
  )
}
