import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const noticeId = Number(id);
  if (isNaN(noticeId)) notFound();

  const notice = await prisma.notice.findUnique({
    where: { id: noticeId },
    include: { author: { select: { name: true } } },
  });
  if (!notice) notFound();

  await prisma.notice.update({ where: { id: noticeId }, data: { viewCount: { increment: 1 } } });

  const [prev, next] = await Promise.all([
    prisma.notice.findFirst({
      where: { id: { lt: noticeId } },
      orderBy: { id: "desc" },
      select: { id: true, title: true },
    }),
    prisma.notice.findFirst({
      where: { id: { gt: noticeId } },
      orderBy: { id: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/notices" className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
        ← 목록으로
      </Link>

      <article>
        <h1 className="text-2xl font-bold mb-3">{notice.title}</h1>
        <div className="flex gap-4 text-sm text-muted-foreground mb-6 pb-4 border-b border-border">
          <span>{notice.author.name}</span>
          <span>{formatDate(notice.createdAt)}</span>
          <span>조회 {notice.viewCount}</span>
        </div>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed min-h-40">
          {notice.content}
        </div>
      </article>

      <div className="mt-10 border-t border-border divide-y divide-border">
        {next && (
          <div className="flex items-center gap-3 py-3 text-sm">
            <span className="text-muted-foreground w-8 shrink-0">▲</span>
            <Link href={`/notices/${next.id}`} className="hover:text-primary truncate">{next.title}</Link>
          </div>
        )}
        {prev && (
          <div className="flex items-center gap-3 py-3 text-sm">
            <span className="text-muted-foreground w-8 shrink-0">▼</span>
            <Link href={`/notices/${prev.id}`} className="hover:text-primary truncate">{prev.title}</Link>
          </div>
        )}
      </div>
    </div>
  );
}
