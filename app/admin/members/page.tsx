import { prisma } from "@/lib/prisma";
import { approveUser, rejectUser } from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";
import type { UserStatus } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "회원 관리 | 관리자" };

const STATUS_LABEL: Record<UserStatus, string> = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "거절",
};

const STATUS_COLOR: Record<UserStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-600 border-red-200",
};

const FILTERS = [
  { value: "PENDING", label: "대기" },
  { value: "APPROVED", label: "승인" },
  { value: "REJECTED", label: "거절" },
  { value: "ALL", label: "전체" },
];

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "PENDING" } = await searchParams;

  const validStatuses: string[] = ["PENDING", "APPROVED", "REJECTED"];
  const where =
    filter === "ALL" || !validStatuses.includes(filter)
      ? {}
      : { status: filter as UserStatus };

  const users = await prisma.user.findMany({
    where,
    include: { alumniProfile: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">회원 관리</h1>

      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <a
            key={f.value}
            href={`/admin/members?filter=${f.value}`}
            className={`px-4 py-1.5 text-sm rounded-lg border transition-colors ${
              filter === f.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-accent"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">이름</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">이메일</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">졸업연도</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">학과</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">상태</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">가입일</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">
                  해당하는 회원이 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-1.5">
                      {user.name}
                      {user.isAdmin && (
                        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full">
                          관리자
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.alumniProfile?.graduationYear ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.alumniProfile?.department ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full border ${STATUS_COLOR[user.status]}`}
                      >
                        {STATUS_LABEL[user.status]}
                      </span>
                      {user.status === "REJECTED" && user.rejectionReason && (
                        <p className="text-xs text-muted-foreground mt-1 max-w-[160px] truncate" title={user.rejectionReason}>
                          {user.rejectionReason}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      {user.status === "PENDING" && (
                        <>
                          <form action={approveUser.bind(null, user.id)}>
                            <button
                              type="submit"
                              className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                              승인
                            </button>
                          </form>
                          <form action={rejectUser} className="flex gap-1">
                            <input type="hidden" name="userId" value={user.id} />
                            <input
                              type="text"
                              name="reason"
                              placeholder="거절 사유 (선택)"
                              className="w-28 px-2 py-1 text-xs border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30"
                            />
                            <button
                              type="submit"
                              className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
                            >
                              거절
                            </button>
                          </form>
                        </>
                      )}
                      {user.status === "REJECTED" && (
                        <form action={approveUser.bind(null, user.id)}>
                          <button
                            type="submit"
                            className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            재승인
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
