import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "대시보드 | 관리자" };

export default async function AdminPage() {
  const [pendingCount, approvedCount, noticeCount, postCount, eventCount] = await Promise.all([
    prisma.user.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { status: "APPROVED" } }),
    prisma.notice.count(),
    prisma.post.count(),
    prisma.event.count(),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">대시보드</h1>

      {pendingCount > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-800">승인 대기 중인 가입 신청</p>
            <p className="text-sm text-amber-600">{pendingCount}명이 승인을 기다리고 있습니다.</p>
          </div>
          <Link
            href="/admin/members"
            className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            확인하기
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "승인 대기", value: pendingCount, href: "/admin/members?filter=PENDING", highlight: pendingCount > 0 },
          { label: "승인 동문", value: approvedCount, href: "/admin/members?filter=APPROVED", highlight: false },
          { label: "공지사항", value: noticeCount, href: "/admin/notices", highlight: false },
          { label: "게시글", value: postCount, href: "/board", highlight: false },
          { label: "행사 일정", value: eventCount, href: "/admin/events", highlight: false },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="p-5 bg-white rounded-xl border border-border hover:shadow-sm transition-shadow"
          >
            <p className={`text-2xl font-bold ${stat.highlight ? "text-amber-600" : "text-foreground"}`}>
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
