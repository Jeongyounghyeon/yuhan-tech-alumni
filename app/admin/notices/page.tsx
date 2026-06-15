import { prisma } from "@/lib/prisma";
import { deleteNotice } from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "공지사항 관리 | 관리자" };

export default async function AdminNoticesPage() {
  const notices = await prisma.notice.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, viewCount: true, createdAt: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">공지사항 관리</h1>
        <Link
          href="/admin/notices/new"
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          + 작성
        </Link>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">제목</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-24">조회수</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-32">작성일</th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {notices.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground text-sm">
                  공지사항이 없습니다.
                </td>
              </tr>
            ) : (
              notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{notice.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{notice.viewCount}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDate(notice.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/notices/${notice.id}/edit`}
                        className="px-3 py-1 text-xs border border-border rounded-lg hover:bg-accent transition-colors"
                      >
                        수정
                      </Link>
                      <form action={deleteNotice}>
                        <input type="hidden" name="id" value={notice.id} />
                        <button
                          type="submit"
                          className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          삭제
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
