import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const status = session?.user?.status;

  // 관리자 전용
  if (pathname.startsWith("/admin")) {
    if (status !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 로그인 동문(APPROVED) 전용
  if (pathname.startsWith("/alumni") || pathname === "/board/new") {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (status === "PENDING" || status === "REJECTED") {
      return NextResponse.redirect(new URL("/pending", req.url));
    }
  }

  // PENDING 전용 페이지 (APPROVED면 홈으로)
  if (pathname === "/pending") {
    if (status === "APPROVED" || status === "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/alumni/:path*", "/board/new", "/pending"],
};
