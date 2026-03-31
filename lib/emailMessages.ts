import vi from "@/messages/email/vi.json"
import en from "@/messages/email/en.json"

export function getEmailMessages(locale: string) {
  if (locale === "en") return en
  return vi
}
