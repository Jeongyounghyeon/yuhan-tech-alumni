import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Pagination } from "@/components/features/Pagination";

export const dynamic = "force-dynamic";

export const metadata = { title: "공지사항 | 유한공업고등학교 총동문회" };

const LIMIT = 10;

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const skip = (page - 1) * LIMIT;

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: LIMIT,
      select: { id: true, title: true, viewCount: true, createdAt: true },
    }),
    prisma.notice.count(),
  ]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="section-title">공지사항</h1>
      <div className="section-divider" />

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-muted/50 text-xs font-semibold text-muted-foreground border-b border-border">
          <span className="col-span-1 text-center">번호</span>
          <span className="col-span-7">제목</span>
          <span className="col-span-2 text-center">날짜</span>
          <span className="col-span-2 text-center">조회</span>
        </div>

        {notices.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 text-sm">등록된 공지사항이 없습니다.</p>
        ) : (
          notices.map((n, i) => (
            <Link
              key={n.id}
              href={`/notices/${n.id}`}
              className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 transition-colors items-center"
            >
              <span className="col-span-1 text-center text-sm text-muted-foreground">
                {total - skip - i}
              </span>
              <span className="col-span-7 text-sm font-medium truncate">{n.title}</span>
              <span className="col-span-2 text-center text-xs text-muted-foreground">
                {formatDate(n.createdAt)}
              </span>
              <span className="col-span-2 text-center text-xs text-muted-foreground">
                {n.viewCount}
              </span>
            </Link>
          ))
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}
