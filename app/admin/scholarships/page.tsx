import { prisma } from "@/lib/prisma";
import { createScholarship, deleteScholarship } from "@/app/actions/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "장학회 관리 | 관리자" };

const INPUT =
  "w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white";

export default async function AdminScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const scholarships = await prisma.scholarship.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">장학회 관리</h1>

      {/* 추가 폼 */}
      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold mb-4">장학금 추가</h2>
        {error === "missing" && (
          <p className="mb-3 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-200">
            장학금명, 금액, 기간을 입력해주세요.
          </p>
        )}
        <form action={createScholarship} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <input type="text" name="name" required placeholder="장학금명" className={INPUT} />
            <input type="text" name="amount" required placeholder="금액 (예: 연 200만원)" className={INPUT} />
            <input type="text" name="period" required placeholder="기간 (예: 1년)" className={INPUT} />
          </div>
          <textarea
            name="description"
            rows={2}
            placeholder="설명 (선택)"
            className={`${INPUT} resize-none`}
          />
          <div className="flex items-center gap-3">
            <input
              type="number"
              name="order"
              placeholder="순서"
              defaultValue={scholarships.length + 1}
              className="w-24 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              추가
            </button>
          </div>
        </form>
      </div>

      {/* 목록 */}
      <div className="border border-border rounded-xl overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-12">순서</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">장학금명</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">금액</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">기간</th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {scholarships.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-sm">
                  등록된 장학금이 없습니다.
                </td>
              </tr>
            ) : (
              scholarships.map((s) => (
                <tr key={s.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground">{s.order}</td>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.amount}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.period}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/scholarships/${s.id}/edit`}
                        className="px-3 py-1 text-xs border border-border rounded-lg hover:bg-accent transition-colors"
                      >
                        수정
                      </Link>
                      <form action={deleteScholarship}>
                        <input type="hidden" name="id" value={s.id} />
                        <button
                          type="submit"
                          className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          삭제
                        </button>
                      </form>
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
