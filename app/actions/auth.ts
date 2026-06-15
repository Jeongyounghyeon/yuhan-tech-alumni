"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function register(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const graduationYear = Number(formData.get("graduationYear"));
  const department = (formData.get("department") as string).trim();

  if (!name || !email || !password || !graduationYear || !department || password.length < 8) {
    redirect("/register?error=missing");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/register?error=exists");
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      status: "PENDING",
      alumniProfile: {
        create: { graduationYear, department },
      },
    },
  });

  redirect("/login?registered=true");
}
