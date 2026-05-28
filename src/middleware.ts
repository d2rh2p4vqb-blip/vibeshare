import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedPaths = ["/submit", "/settings", "/chat", "/notifications"];

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isProtected = protectedPaths.some((p) => path.startsWith(p));
  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
