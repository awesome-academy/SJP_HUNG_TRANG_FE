import { getServerSession } from "next-auth"
import { notFound, redirect } from "next/navigation"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ROLES } from "@/constants/role"
import { ROUTES } from "@/constants/router"
import { authOptions } from "@/lib/auth"

type Product = {
    id: string
    name: string
    price: number
    stock: number
}

type Order = {
    id: string
    status: string
    totalPrice: number
}

type User = {
    id: string
    role: string
    isActive?: boolean
}

type ProductSuggestion = {
    id: string
    productName: string
    description?: string
    photos?: Array<{ id: string | number; url: string }>
}

async function fetchCollection<T>(endpoint: string): Promise<T[]> {
    const baseUrl = process.env.JSON_SERVER_URL

    if (!baseUrl) {
        return []
    }

    try {
        const response = await fetch(`${baseUrl}/${endpoint}`, { cache: "no-store" })

        if (!response.ok) {
            return []
        }

        const data = await response.json()
        return Array.isArray(data) ? (data as T[]) : []
    } catch {
        return []
    }
}

type AdminPageProps = {
    params: Promise<{ locale: string }>
}

export default async function AdminPage({ params }: AdminPageProps) {
    const { locale } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect(`/${locale}${ROUTES.LOGIN}`)
    }

    if (session.user.role !== ROLES.ADMIN) {
        notFound()
    }

    const [products, orders, users, suggestions] = await Promise.all([
        fetchCollection<Product>("products"),
        fetchCollection<Order>("orders"),
        fetchCollection<User>("users"),
        fetchCollection<ProductSuggestion>("productSuggestions"),
    ])

    const totalProducts = products.length
    const lowStockProducts = products.filter((product) => product.stock <= 5).length
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0)

    const totalOrders = orders.length
    const pendingOrders = orders.filter((order) => order.status === "PENDING").length
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const customerUsers = users.filter((user) => user.role === ROLES.USER)
    const totalCustomers = customerUsers.length
    const activeCustomers = customerUsers.filter((user) => user.isActive).length
    const totalSuggestions = suggestions.length

    const currency = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    })

    return (
        <div className="mx-auto w-full max-w-[1280px] px-4 py-10 md:px-6">
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Theo dõi số liệu kinh doanh và các sản phẩm người dùng đề xuất.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardDescription>Tổng sản phẩm</CardDescription>
                        <CardTitle>{totalProducts}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Tồn kho tổng: {totalStock} sản phẩm
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardDescription>Đơn hàng</CardDescription>
                        <CardTitle>{totalOrders}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Đang chờ xử lý: {pendingOrders} đơn
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardDescription>Doanh thu</CardDescription>
                        <CardTitle>{currency.format(totalRevenue)}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Giá trị trung bình/đơn: {currency.format(avgOrderValue)}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardDescription>Khách hàng</CardDescription>
                        <CardTitle>{totalCustomers}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Hoạt động: {activeCustomers} | Đề xuất: {totalSuggestions}
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Sản phẩm cần quan tâm</CardTitle>
                        <CardDescription>Các chỉ số vận hành nhanh</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span>Sản phẩm tồn kho thấp (≤ 5)</span>
                            <span className="font-medium">{lowStockProducts}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span>Tổng đề xuất từ người dùng</span>
                            <span className="font-medium">{totalSuggestions}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span>Tỉ lệ đơn đang chờ</span>
                            <span className="font-medium">
                                {totalOrders > 0 ? Math.round((pendingOrders / totalOrders) * 100) : 0}%
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Danh mục đề xuất</CardTitle>
                        <CardDescription>Ảnh đính kèm từ người dùng</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {suggestions.length === 0 ? (
                            <p className="text-muted-foreground">Chưa có đề xuất nào.</p>
                        ) : (
                            suggestions.map((suggestion) => (
                                <div key={suggestion.id} className="rounded-lg border p-3">
                                    <p className="font-medium">{suggestion.productName}</p>
                                    <p className="mt-1 line-clamp-2 text-muted-foreground">
                                        {suggestion.description || "Không có mô tả"}
                                    </p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Ảnh đính kèm: {suggestion.photos?.length ?? 0}
                                    </p>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
