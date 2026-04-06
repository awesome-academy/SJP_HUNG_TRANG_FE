"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Image from "next/image"

type ProductSuggestion = {
    id: string
    productName: string
    description?: string
    photos?: Array<{ id: string | number; url: string }>
}

type SuggestionsCardProps = {
    suggestions: ProductSuggestion[]
}

const ITEMS_PER_PAGE = 3

export default function SuggestionsCard({ suggestions }: SuggestionsCardProps) {
    const t = useTranslations("Admin.suggestions")
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.max(1, Math.ceil(suggestions.length / ITEMS_PER_PAGE))

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])

    const visibleSuggestions = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return suggestions.slice(start, start + ITEMS_PER_PAGE)
    }, [currentPage, suggestions])

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("title")}</CardTitle>
                <CardDescription>{t("description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                {suggestions.length === 0 ? (
                    <p className="text-muted-foreground">{t("empty")}</p>
                ) : (
                    <>
                        {visibleSuggestions.map((suggestion) => (
                            <div key={suggestion.id} className="rounded-lg border p-3">
                                <p className="font-medium">{suggestion.productName}</p>
                                <p className="mt-1 line-clamp-2 text-muted-foreground">
                                    {suggestion.description || t("noDescription")}
                                </p>
                                {suggestion.photos?.[0]?.url && (
                                    <Image
                                        src={suggestion.photos?.[0]?.url || "/images/placeholder.png"}
                                        alt={suggestion.productName}
                                        width={80}
                                        height={80}
                                        className="mt-2 h-20 w-20 rounded object-cover"
                                    />
                                )}
                            </div>
                        ))}

                        <div className="flex items-center justify-between border-t pt-2">
                            <p className="text-xs text-muted-foreground">
                                {t("pagination", {
                                    current: currentPage,
                                    total: totalPages,
                                })}
                            </p>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                >
                                    {t("prev")}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                >
                                    {t("next")}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
