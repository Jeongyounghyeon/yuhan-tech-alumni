"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "대시보드", exact: true },
  { href: "/admin/members", label: "회원 관리" },
  { href: "/admin/notices", label: "공지사항" },
  { href: "/admin/events", label: "행사 일정" },
  { href: "/admin/officers", label: "임원진" },
  { href: "/admin/scholarships", label: "장학회" },
];

export function AdminNav({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? "bg-white/20 text-white font-medium"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span>{item.label}</span>
            {item.href === "/admin/members" && pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
