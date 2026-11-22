import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const secret = process.env.NEXTAUTH_SECRET || "default-development-secret-change-in-env";

// Route protection:
// - /admin/* requires a signed-in admin (except the admin login page itself)
// - /account, /profile, /settings, /protected require any signed-in user
export default async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const token = await getToken({ req, secret });
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute ? token?.role !== "admin" : !token) {
    const url = req.nextUrl.clone();
    url.pathname = isAdminRoute ? "/admin/login" : "/sign-in";
    url.search = `?callbackUrl=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/protected/:path*", "/admin/:path*", "/account/:path*", "/profile/:path*", "/settings/:path*"],
};
