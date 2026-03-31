"use client";

import { SubmitEvent, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SubmitStatus = {
  type: "success" | "error";
  message: string;
} | null;

export default function ContactForms() {
  const t = useTranslations("ContactPage");

  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<SubmitStatus>(null);
  const [submittingEmail, setSubmittingEmail] = useState(false);

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [suggestionStatus, setSuggestionStatus] = useState<SubmitStatus>(null);
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const photoPreview = useMemo(
    () => photoFiles.map((file) => file.name),
    [photoFiles]
  );

  async function uploadSuggestionPhotos(files: File[]): Promise<string[]> {
    if (!files.length) {
      return [];
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("photos", file);
    });

    const uploadResponse = await fetch("/api/uploads/suggested-products", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error("upload_failed");
    }

    const uploadData = (await uploadResponse.json()) as { urls?: string[] };
    return uploadData.urls ?? [];
  }

  async function handleEmailSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailStatus(null);
    setSubmittingEmail(true);

    try {
      const response = await fetch("/api/email-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setEmailStatus({ type: "success", message: t("newsletter.success") });
        setEmail("");
      } else if (response.status === 409) {
        setEmailStatus({ type: "error", message: t("newsletter.existed") });
      } else {
        setEmailStatus({ type: "error", message: t("newsletter.error") });
      }
    } catch {
      setEmailStatus({ type: "error", message: t("newsletter.error") });
    } finally {
      setSubmittingEmail(false);
    }
  }

  async function handleSuggestionSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuggestionStatus(null);
    setSubmittingSuggestion(true);

    try {
      const uploadedPhotoUrls = await uploadSuggestionPhotos(photoFiles);
      const photos = uploadedPhotoUrls.map((url) => ({ url }));

      const response = await fetch("/api/product-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          description,
          photos,
        }),
      });

      if (response.ok) {
        setSuggestionStatus({ type: "success", message: t("suggestion.success") });
        setProductName("");
        setDescription("");
        setPhotoFiles([]);
        if (photoInputRef.current) {
          photoInputRef.current.value = "";
        }
      } else {
        setSuggestionStatus({ type: "error", message: t("suggestion.error") });
      }
    } catch {
      setSuggestionStatus({ type: "error", message: t("suggestion.uploadError") });
    } finally {
      setSubmittingSuggestion(false);
    }
  }

  return (
    <main className="w-full bg-[#f6f6f6] py-8 md:py-12">
      <section className="mx-auto grid w-full max-w-[1200px] gap-6 px-4 lg:grid-cols-2">
        <Card className="border border-zinc-200 bg-white py-0">
          <CardHeader className="border-b border-zinc-200 py-5">
            <CardTitle className="text-2xl font-semibold uppercase tracking-wide text-zinc-800">
              {t("newsletter.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-5">
            <p className="text-sm text-zinc-600">{t("newsletter.description")}</p>

            <form className="space-y-4" onSubmit={handleEmailSubmit}>
              <div className="space-y-2">
                <label htmlFor="newsletter-email" className="text-sm font-medium text-zinc-700">
                  {t("newsletter.emailLabel")}
                </label>
                <Input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t("newsletter.emailPlaceholder")}
                  required
                />
              </div>

              <Button
                type="submit"
                className="h-10 w-full bg-zinc-900 text-white hover:bg-zinc-700"
                disabled={submittingEmail}
              >
                {submittingEmail ? t("actions.submitting") : t("newsletter.submit")}
              </Button>
            </form>

            {emailStatus ? (
              <p
                className={
                  emailStatus.type === "success" ? "text-sm text-green-600" : "text-sm text-red-600"
                }
              >
                {emailStatus.message}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white py-0">
          <CardHeader className="border-b border-zinc-200 py-5">
            <CardTitle className="text-2xl font-semibold uppercase tracking-wide text-zinc-800">
              {t("suggestion.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-5">
            <p className="text-sm text-zinc-600">{t("suggestion.descriptionText")}</p>

            <form className="space-y-4" onSubmit={handleSuggestionSubmit}>
              <div className="space-y-2">
                <label htmlFor="product-name" className="text-sm font-medium text-zinc-700">
                  {t("suggestion.productNameLabel")}
                </label>
                <Input
                  id="product-name"
                  value={productName}
                  onChange={(event) => setProductName(event.target.value)}
                  placeholder={t("suggestion.productNamePlaceholder")}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="product-description" className="text-sm font-medium text-zinc-700">
                  {t("suggestion.descriptionLabel")}
                </label>
                <textarea
                  id="product-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={t("suggestion.descriptionPlaceholder")}
                  className="min-h-[96px] w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="product-photos" className="text-sm font-medium text-zinc-700">
                  {t("suggestion.photosLabel")}
                </label>
                <Input
                  ref={photoInputRef}
                  id="product-photos"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const fileList = event.target.files;
                    const files = fileList && fileList[0] ? [fileList[0]] : [];
                    setPhotoFiles(files);
                  }}
                  className="h-auto py-2"
                />
                <p className="text-xs text-zinc-500">{t("suggestion.photosHelp")}</p>
              </div>

              {photoPreview.length ? (
                <div className="rounded-lg bg-zinc-50 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase text-zinc-600">
                    {t("suggestion.previewTitle")}
                  </p>
                  <ul className="space-y-1 text-xs text-zinc-600">
                    {photoPreview.map((url, index) => (
                      <li key={`${url}-${index}`}>{url}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <Button
                type="submit"
                className="h-10 w-full bg-zinc-900 text-white hover:bg-zinc-700"
                disabled={submittingSuggestion}
              >
                {submittingSuggestion ? t("actions.submitting") : t("suggestion.submit")}
              </Button>
            </form>

            {suggestionStatus ? (
              <p
                className={
                  suggestionStatus.type === "success"
                    ? "text-sm text-green-600"
                    : "text-sm text-red-600"
                }
              >
                {suggestionStatus.message}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
