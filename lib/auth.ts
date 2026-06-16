import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserStatus } from "@/app/generated/prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        // REJECTED 유저도 로그인 허용 — 미들웨어가 /pending으로 리다이렉트
        return { id: String(user.id), email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // 매 요청마다 DB에서 최신 상태 조회 (관리자 권한 변경 즉시 반영)
      const dbUser = await prisma.user.findUnique({
        where: { id: Number(token.id) },
        select: { status: true, isAdmin: true },
      });
      token.status = dbUser?.status;
      token.isAdmin = dbUser?.isAdmin ?? false;
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.status = token.status as UserStatus;
      session.user.isAdmin = token.isAdmin ?? false;
      return session;
    },
  },
});
