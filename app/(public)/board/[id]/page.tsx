import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);
  if (isNaN(postId)) notFound();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: { name: true } },
      comments: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!post) notFound();

  await prisma.post.update({ where: { id: postId }, data: { viewCount: { increment: 1 } } });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/board" className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
        ← 목록으로
      </Link>

      <article>
        <h1 className="text-2xl font-bold mb-3">{post.title}</h1>
        <div className="flex gap-4 text-sm text-muted-foreground mb-6 pb-4 border-b border-border">
          <span>{post.author.name}</span>
          <span>{formatDate(post.createdAt)}</span>
          <span>조회 {post.viewCount}</span>
        </div>
        <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed min-h-40">
          {post.content}
        </div>
      </article>

      {/* 댓글 */}
      <section className="mt-10 border-t border-border pt-6">
        <h2 className="font-bold mb-4 text-sm">댓글 {post.comments.length}개</h2>
        {post.comments.length > 0 && (
          <ul className="flex flex-col gap-4 mb-6">
            {post.comments.map((c) => (
              <li key={c.id} className="bg-muted/40 rounded-lg px-4 py-3">
                <div className="flex gap-2 text-xs text-muted-foreground mb-1.5">
                  <span className="font-medium text-foreground">{c.author.name}</span>
                  <span>{formatDate(c.createdAt)}</span>
                </div>
                <p className="text-sm">{c.content}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm text-muted-foreground">댓글 작성은 로그인 후 이용 가능합니다.</p>
      </section>
    </div>
  );
}
