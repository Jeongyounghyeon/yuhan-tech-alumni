import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { deleteGallery } from "@/app/actions/gallery";

export const dynamic = "force-dynamic";

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);
  if (isNaN(postId)) notFound();

  const [post, session] = await Promise.all([
    prisma.galleryPost.findUnique({
      where: { id: postId },
      include: {
        author: { select: { name: true } },
        images: { orderBy: { order: "asc" } },
      },
    }),
    auth(),
    prisma.galleryPost.update({ where: { id: postId }, data: { viewCount: { increment: 1 } } }).catch(() => null),
  ]);
  if (!post) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/gallery" className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
        ← 목록으로
      </Link>

      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        {session?.user.isAdmin && (
          <div className="flex gap-2 shrink-0">
            <Link
              href={`/gallery/${postId}/edit`}
              className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-accent transition-colors"
            >
              수정
            </Link>
            <form action={deleteGallery}>
              <input type="hidden" name="id" value={postId} />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                삭제
              </button>
            </form>
          </div>
        )}
      </div>
      <div className="flex gap-4 text-sm text-muted-foreground mb-6 pb-4 border-b border-border">
        <span>{post.author.name}</span>
        <span>{formatDate(post.createdAt)}</span>
        <span>조회 {post.viewCount}</span>
      </div>

      {post.content && (
        <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed mb-8">{post.content}</p>
      )}

      {post.images.length > 0 && (
        <div className="flex flex-col gap-4">
          {post.images.map((img) => (
            <div key={img.id} className="relative w-full rounded-xl overflow-hidden bg-muted">
              <Image
                src={img.url}
                alt={post.title}
                width={800}
                height={600}
                className="w-full h-auto object-contain"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
