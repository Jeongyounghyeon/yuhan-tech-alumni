import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const status = session?.user?.status;
  const isAdmin = session?.user?.isAdmin;

  // REJECTED: /pending 외 모든 경로 차단
  if (status === "REJECTED" && pathname !== "/pending") {
    return NextResponse.redirect(new URL("/pending", req.url));
  }

  // 관리자 전용
  if (pathname.startsWith("/admin")) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 로그인 동문(APPROVED) 전용
  if (pathname.startsWith("/alumni") || pathname === "/board/new") {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (status === "PENDING") {
      return NextResponse.redirect(new URL("/pending", req.url));
    }
  }

  // /pending: APPROVED·관리자는 홈으로
  if (pathname === "/pending") {
    if (status === "APPROVED" || isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
