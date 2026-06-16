"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function assertApproved(status?: string) {
  if (status !== "APPROVED") {
    redirect("/login");
  }
}

export async function createPost(formData: FormData) {
  const session = await auth();
  assertApproved(session?.user.status);

  const title = (formData.get("title") as string).trim();
  const content = (formData.get("content") as string).trim();
  if (!title || !content) return;

  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId: Number(session!.user.id),
    },
  });

  redirect(`/board/${post.id}`);
}

export async function createComment(formData: FormData) {
  const session = await auth();
  assertApproved(session?.user.status);

  const postId = Number(formData.get("postId"));
  const content = (formData.get("content") as string).trim();
  if (!content || isNaN(postId)) return;

  await prisma.comment.create({
    data: {
      content,
      authorId: Number(session!.user.id),
      postId,
    },
  });

  redirect(`/board/${postId}`);
}
