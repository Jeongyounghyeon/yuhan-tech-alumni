import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Pagination } from "@/components/features/Pagination";

export const dynamic = "force-dynamic";

export const metadata = { title: "갤러리 | 유한공업고등학교 총동문회" };

const LIMIT = 12;

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const skip = (page - 1) * LIMIT;

  const [posts, total] = await Promise.all([
    prisma.galleryPost.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: LIMIT,
      select: {
        id: true,
        title: true,
        createdAt: true,
        images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
      },
    }),
    prisma.galleryPost.count(),
  ]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="section-title">갤러리</h1>
      <div className="section-divider" />

      {posts.length === 0 ? (
        <p className="text-muted-foreground text-sm">등록된 갤러리가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((p) => {
            const thumb = p.images[0]?.url;
            return (
              <Link key={p.id} href={`/gallery/${p.id}`} className="group rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      이미지 없음
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(p.createdAt)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}
