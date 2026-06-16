"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { r2, R2_BUCKET, r2KeyFromUrl } from "@/lib/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { assertAdmin } from "@/app/actions/admin";

async function deleteImageFromR2(url: string) {
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: r2KeyFromUrl(url) }));
  } catch (e) {
    console.error("R2 이미지 삭제 실패:", url, e);
  }
}

export async function createGallery(formData: FormData) {
  const session = await assertAdmin();
  const title = (formData.get("title") as string).trim();
  const content = (formData.get("content") as string).trim();
  if (!title) redirect("/gallery/new?error=missing");

  const imageUrls = formData.getAll("imageUrl") as string[];

  const post = await prisma.galleryPost.create({
    data: {
      title,
      content: content || null,
      authorId: Number(session.user.id),
      images: {
        create: imageUrls.map((url, order) => ({ url, order })),
      },
    },
  });

  revalidatePath("/gallery");
  redirect(`/gallery/${post.id}`);
}

export async function updateGallery(formData: FormData) {
  await assertAdmin();
  const id = Number(formData.get("id"));
  const title = (formData.get("title") as string).trim();
  const content = (formData.get("content") as string).trim();
  if (!title) redirect(`/gallery/${id}/edit?error=missing`);

  const keepIds = (formData.getAll("keepImageId") as string[]).map(Number);
  const newUrls = formData.getAll("imageUrl") as string[];

  const toDelete = await prisma.galleryImage.findMany({
    where: { postId: id, id: { notIn: keepIds } },
  });

  await Promise.all(toDelete.map((img) => deleteImageFromR2(img.url)));

  await prisma.galleryPost.update({
    where: { id },
    data: {
      title,
      content: content || null,
      images: {
        deleteMany: { id: { in: toDelete.map((img) => img.id) } },
        create: newUrls.map((url, i) => ({ url, order: keepIds.length + i })),
      },
    },
  });

  revalidatePath("/gallery");
  revalidatePath(`/gallery/${id}`);
  redirect(`/gallery/${id}`);
}

export async function deleteGallery(formData: FormData) {
  await assertAdmin();
  const id = Number(formData.get("id"));

  const images = await prisma.galleryImage.findMany({ where: { postId: id } });

  await Promise.all([
    Promise.all(images.map((img) => deleteImageFromR2(img.url))),
    prisma.galleryPost.delete({ where: { id } }),
  ]);

  revalidatePath("/gallery");
  redirect("/gallery");
}
