"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/notices", label: "공지사항" },
  { href: "/board", label: "자유게시판" },
  { href: "/alumni", label: "동문 명부" },
  { href: "/events", label: "행사 일정" },
  { href: "/gallery", label: "갤러리" },
  { href: "/officers", label: "임원진" },
  { href: "/scholarship", label: "장학회" },
];

type UserInfo = {
  name?: string | null;
  image?: string | null;
  status?: string;
} | null;

interface HeaderProps {
  user?: UserInfo;
  signOutButton?: React.ReactNode;
}

export function Header({ user, signOutButton }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* 상단 알림바 */}
      <div className="bg-primary text-primary-foreground py-1.5 text-center text-xs tracking-widest">
        유한공업고등학교 총동문회 · 창립 정신 · 기술 연마 · 사회 봉사
      </div>

      {/* 메인 네비게이션 */}
      <div className="bg-white border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/favicon.ico"
              alt="유한공업고등학교 총동문회 로고"
              width={40}
              height={40}
              unoptimized
              className="rounded-full shrink-0"
              style={{ width: 40, height: 40 }}
            />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-primary leading-tight">유한공업고등학교</p>
              <p className="text-xs text-muted-foreground">총동문회</p>
            </div>
          </Link>

          {/* 데스크톱 메뉴 */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "text-primary bg-accent"
                    : "text-foreground hover:text-primary hover:bg-accent"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 인증 영역 */}
          <div className="hidden lg:flex items-center gap-3">
            {!user ? (
              <Link
                href="/login"
                className="px-4 py-1.5 text-sm font-medium border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                로그인
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                {user.status === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium hover:bg-primary/20 transition-colors"
                  >
                    관리자
                  </Link>
                )}
                {user.status === "PENDING" && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                    승인 대기
                  </span>
                )}
                <div className="flex items-center gap-2">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name ?? ""}
                      className="w-7 h-7 rounded-full"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                      {user.name?.[0] ?? "?"}
                    </div>
                  )}
                  <span className="text-sm text-foreground">{user.name}</span>
                </div>
                {signOutButton}
              </div>
            )}
          </div>

          {/* 모바일 햄버거 */}
          <button
            className="lg:hidden p-2 rounded-md text-foreground hover:bg-accent"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="메뉴 열기"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* 모바일 드로어 */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-white">
            <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                    pathname === item.href
                      ? "text-primary bg-accent"
                      : "text-foreground hover:text-primary hover:bg-accent"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-border mt-1">
                {!user ? (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-primary"
                  >
                    로그인
                  </Link>
                ) : (
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{user.name}</span>
                      {user.status === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"
                        >
                          관리자
                        </Link>
                      )}
                    </div>
                    {signOutButton}
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
