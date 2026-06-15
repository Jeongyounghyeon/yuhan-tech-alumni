import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user.status !== "ADMIN") redirect("/");

  const pendingCount = await prisma.user.count({ where: { status: "PENDING" } });

  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-primary text-primary-foreground flex flex-col shrink-0">
        <div className="p-4 border-b border-white/20">
          <p className="text-[11px] text-white/50 uppercase tracking-wider">유한공고 총동문회</p>
          <h1 className="font-bold text-white mt-0.5">관리자</h1>
        </div>

        <AdminNav pendingCount={pendingCount} />

        <div className="p-4 border-t border-white/20">
          <p className="text-xs text-white/50 mb-2 truncate">{session.user.name}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
