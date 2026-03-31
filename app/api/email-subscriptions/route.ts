import { NextResponse } from "next/server";
import { apiGet, apiPost } from "@/lib/json-server";
import type { EmailSubscription } from "@/lib/mock-db";
import { getTranslations } from "next-intl/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export async function POST(request: Request) {
  const { email } = await request.json();
  const t = await getTranslations("ContactPage");
  
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: t("newsletter.error") }, { status: 400 });
  }

  const existingSubscriptions = await apiGet<EmailSubscription[]>(`/emailSubscriptions?email=${encodeURIComponent(email)}`);
  if (existingSubscriptions.some((sub) => sub.email === email)) {
    return NextResponse.json({ error: t("newsletter.existed") }, { status: 409 }); 
  }

  const result = await apiPost<EmailSubscription>("/emailSubscriptions", { email });
  return NextResponse.json(result, { status: 201 });
}
