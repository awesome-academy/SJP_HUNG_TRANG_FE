'use client'

import { useRouter } from "@/i18n/navigation"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ROUTES } from "@/constants/router"

import {
  Field,
  FieldLabel,
  FieldError
} from "@/components/ui/field"

import { Undo2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function RegisterPage() {
  const t = useTranslations("Auth.register")
  const locale = useLocale()

  const formSchema = z.object({
    firstName: z.string().min(1, t("validation.required")),
    lastName: z.string().min(1, t("validation.required")),
    email: z.string().email(t("validation.email")),
    password: z.string().min(6, t("validation.minPassword")),
    confirmPassword: z.string(),
    subscribe: z.boolean().optional()
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("validation.passwordMatch"),
    path: ["confirmPassword"],
  })

  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      subscribe: false
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ...values, locale })
    })

    setLoading(false)
    const data = await res.json()

    if (!res.ok) {
      toast.error(data.message || t("error"))
      return
    }

    toast.success(t("success"))
    router.push(ROUTES.LOGIN)
  }

  return (
    <div className="max-w-[1440px] px-12 mx-auto py-10 w-full">
      <h1 className="text-2xl uppercase mb-6">{t("title")}</h1>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-gray-100 p-6 space-y-6 mx-auto"
      >
        <div>
          <h2 className="uppercase mb-4">{t("personalInfo")}</h2>

          <div className="space-y-4">

            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t("firstName")} *</FieldLabel>
                  <Input {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="lastName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t("lastName")} *</FieldLabel>
                  <Input {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t("email")} *</FieldLabel>
                  <Input type="email" {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="subscribe"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                    className="bg-white cursor-pointer"
                  />
                  <span>{t("subscribe")}</span>
                </div>
              )}
            />
          </div>
        </div>

        <div>
          <h2 className="uppercase mb-4">{t("authInfo")}</h2>

          <div className="space-y-4">

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t("password")} *</FieldLabel>
                  <Input type="password" {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t("confirmPassword")} *</FieldLabel>
                  <Input type="password" {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </div>

        <div className="flex justify-between">
          <Button disabled={loading} type="submit" className="bg-black text-white rounded-none uppercase cursor-pointer">
            {t("submit")}
          </Button>

          <Button
            type="button"
            onClick={() => router.push("/login")}
            className="bg-black text-white rounded-none uppercase flex items-center gap-2 cursor-pointer"
          >
            <Undo2 size={16} />
            {t("back")}
          </Button>
        </div>

      </form>
    </div>
  )
}
