import NextAuth from "next-auth";
import { authConfig } from "@/server/auth/config";

// Edge-compatible: usa apenas a config (sem o PrismaAdapter, que precisa de Node).
// O adapter só roda no route handler nodejs.
export const { auth: middleware } = NextAuth({
  ...authConfig,
  adapter: undefined,
});

export default middleware((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/create"];
  if (protectedRoutes.some((p) => pathname.startsWith(p)) && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
