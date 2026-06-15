import { prisma } from "@/lib/prisma";
import { createOfficer, deleteOfficer } from "@/app/actions/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "임원진 관리 | 관리자" };

const INPUT =
  "w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white";

export default async function AdminOfficersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const officers = await prisma.officer.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">임원진 관리</h1>

      {/* 추가 폼 */}
      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold mb-4">임원 추가</h2>
        {error === "missing" && (
          <p className="mb-3 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-200">
            이름과 직책을 입력해주세요.
          </p>
        )}
        <form action={createOfficer} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <input type="text" name="name" required placeholder="이름" className={INPUT} />
          <input type="text" name="position" required placeholder="직책" className={INPUT} />
          <input type="number" name="graduationYear" placeholder="졸업연도" className={INPUT} />
          <input type="number" name="order" placeholder="순서 (숫자)" defaultValue={officers.length + 1} className={INPUT} />
          <div className="col-span-2 sm:col-span-4 flex justify-end">
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
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">이름</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">직책</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">졸업연도</th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {officers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-sm">
                  등록된 임원이 없습니다.
                </td>
              </tr>
            ) : (
              officers.map((officer) => (
                <tr key={officer.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground">{officer.order}</td>
                  <td className="px-4 py-3 font-medium">{officer.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{officer.position}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {officer.graduationYear ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/officers/${officer.id}/edit`}
                        className="px-3 py-1 text-xs border border-border rounded-lg hover:bg-accent transition-colors"
                      >
                        수정
                      </Link>
                      <form action={deleteOfficer}>
                        <input type="hidden" name="id" value={officer.id} />
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
