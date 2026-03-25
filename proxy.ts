import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // 1. Bỏ qua API và file tĩnh
    if (pathname.startsWith("/api") || pathname.includes(".")) {
      return NextResponse.next();
    }

    // 2. Xác định locale thông minh hơn
    const segments = pathname.split("/");
    const localeFromUrl = routing.locales.includes(segments[1] as any) ? segments[1] : null;
    
    // Ưu tiên: URL > Cookie > Default
    const locale = localeFromUrl || 
                   req.cookies.get("NEXT_LOCALE")?.value || 
                   routing.defaultLocale;

    // 3. Lấy path thuần (không bao gồm locale)
    const pathWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), "") || "/";

    // 4. Logic cho Login / Register
    if (pathWithoutLocale === "/login" || pathWithoutLocale === "/register") {
      if (token) {
        return NextResponse.redirect(new URL(`/${locale}`, req.url));
      }
      return intlMiddleware(req);
    }

    // 5. Bảo vệ Admin / User
    const isAdminRoute = pathWithoutLocale.startsWith("/admin");
    const isUserRoute = pathWithoutLocale.startsWith("/user");

    if (isAdminRoute || isUserRoute) {
      if (!token) {
        // Luôn đính kèm đúng locale vào link login
        const loginUrl = new URL(`/${locale}/login`, req.url);
        // pathname ở đây đã chứa locale gốc (ví dụ: /en/admin)
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check quyền Admin
      if (isAdminRoute && token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL(`/${locale}`, req.url));
      }
    }

    // 6. Chạy i18n middleware để đảm bảo các header locale được set đúng
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: () => true, // Để middleware xử lý logic redirect thủ công
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
