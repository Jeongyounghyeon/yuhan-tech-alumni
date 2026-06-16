import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GalleryForm } from "@/components/features/GalleryForm";

export const metadata = { title: "갤러리 수정 | 유한공업고등학교 총동문회" };

export default async function GalleryEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user.isAdmin) redirect("/");

  const { id } = await params;
  const { error } = await searchParams;
  const postId = Number(id);
  if (isNaN(postId)) notFound();

  const post = await prisma.galleryPost.findUnique({
    where: { id: postId },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!post) notFound();

  return (
    <GalleryForm
      mode="edit"
      postId={post.id}
      defaultTitle={post.title}
      defaultContent={post.content ?? undefined}
      existingImages={post.images}
      error={error}
    />
  );
}
