"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user.isAdmin) redirect("/");
  return session!;
}

// ── 회원 관리 ──────────────────────────────────────────

export async function approveUser(userId: number) {
  await assertAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { status: "APPROVED", rejectionReason: null },
  });
  revalidatePath("/admin/members");
}

export async function rejectUser(formData: FormData) {
  await assertAdmin();
  const userId = Number(formData.get("userId"));
  const reason = (formData.get("reason") as string | null)?.trim() || null;
  await prisma.user.update({
    where: { id: userId },
    data: { status: "REJECTED", rejectionReason: reason },
  });
  revalidatePath("/admin/members");
}

// ── 공지사항 ──────────────────────────────────────────

export async function createNotice(formData: FormData) {
  const session = await assertAdmin();
  const title = (formData.get("title") as string).trim();
  const content = (formData.get("content") as string).trim();
  if (!title || !content) redirect("/admin/notices/new?error=missing");
  await prisma.notice.create({
    data: { title, content, authorId: Number(session.user.id) },
  });
  redirect("/admin/notices");
}

export async function updateNotice(formData: FormData) {
  await assertAdmin();
  const id = Number(formData.get("id"));
  const title = (formData.get("title") as string).trim();
  const content = (formData.get("content") as string).trim();
  if (!title || !content) redirect(`/admin/notices/${id}/edit?error=missing`);
  await prisma.notice.update({ where: { id }, data: { title, content } });
  redirect("/admin/notices");
}

export async function deleteNotice(formData: FormData) {
  await assertAdmin();
  const id = Number(formData.get("id"));
  await prisma.notice.delete({ where: { id } });
  revalidatePath("/admin/notices");
}

// ── 임원진 ──────────────────────────────────────────

export async function createOfficer(formData: FormData) {
  await assertAdmin();
  const name = (formData.get("name") as string).trim();
  const position = (formData.get("position") as string).trim();
  const graduationYear = formData.get("graduationYear")
    ? Number(formData.get("graduationYear"))
    : null;
  const order = Number(formData.get("order") || 0);
  if (!name || !position) redirect("/admin/officers?error=missing");
  await prisma.officer.create({ data: { name, position, graduationYear, order } });
  revalidatePath("/admin/officers");
}

export async function updateOfficer(formData: FormData) {
  await assertAdmin();
  const id = Number(formData.get("id"));
  const name = (formData.get("name") as string).trim();
  const position = (formData.get("position") as string).trim();
  const graduationYear = formData.get("graduationYear")
    ? Number(formData.get("graduationYear"))
    : null;
  const order = Number(formData.get("order") || 0);
  await prisma.officer.update({ where: { id }, data: { name, position, graduationYear, order } });
  redirect("/admin/officers");
}

export async function deleteOfficer(formData: FormData) {
  await assertAdmin();
  const id = Number(formData.get("id"));
  await prisma.officer.delete({ where: { id } });
  revalidatePath("/admin/officers");
}

// ── 행사 일정 ──────────────────────────────────────────

export async function createEvent(formData: FormData) {
  const session = await assertAdmin();
  const title = (formData.get("title") as string).trim();
  const description = (formData.get("description") as string).trim();
  const location = (formData.get("location") as string).trim();
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);
  if (!title || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    redirect("/admin/events/new?error=missing");
  }
  await prisma.event.create({
    data: {
      title,
      description: description || null,
      location: location || null,
      startDate,
      endDate,
      authorId: Number(session.user.id),
    },
  });
  redirect("/admin/events");
}

export async function updateEvent(formData: FormData) {
  await assertAdmin();
  const id = Number(formData.get("id"));
  const title = (formData.get("title") as string).trim();
  const description = (formData.get("description") as string).trim();
  const location = (formData.get("location") as string).trim();
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);
  await prisma.event.update({
    where: { id },
    data: {
      title,
      description: description || null,
      location: location || null,
      startDate,
      endDate,
    },
  });
  redirect("/admin/events");
}

export async function deleteEvent(formData: FormData) {
  await assertAdmin();
  const id = Number(formData.get("id"));
  await prisma.event.delete({ where: { id } });
  revalidatePath("/admin/events");
}

// ── 장학회 ──────────────────────────────────────────

export async function createScholarship(formData: FormData) {
  await assertAdmin();
  const name = (formData.get("name") as string).trim();
  const amount = (formData.get("amount") as string).trim();
  const period = (formData.get("period") as string).trim();
  const description = (formData.get("description") as string).trim();
  const order = Number(formData.get("order") || 0);
  if (!name || !amount || !period) redirect("/admin/scholarships?error=missing");
  await prisma.scholarship.create({
    data: { name, amount, period, description: description || null, order },
  });
  revalidatePath("/admin/scholarships");
}

export async function updateScholarship(formData: FormData) {
  await assertAdmin();
  const id = Number(formData.get("id"));
  const name = (formData.get("name") as string).trim();
  const amount = (formData.get("amount") as string).trim();
  const period = (formData.get("period") as string).trim();
  const description = (formData.get("description") as string).trim();
  const order = Number(formData.get("order") || 0);
  await prisma.scholarship.update({
    where: { id },
    data: { name, amount, period, description: description || null, order },
  });
  redirect("/admin/scholarships");
}

export async function deleteScholarship(formData: FormData) {
  await assertAdmin();
  const id = Number(formData.get("id"));
  await prisma.scholarship.delete({ where: { id } });
  revalidatePath("/admin/scholarships");
}
