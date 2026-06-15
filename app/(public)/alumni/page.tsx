import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Pagination } from "@/components/features/Pagination";
import Link from "next/link";
import type { Prisma } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "동문 명부 | 유한공업고등학교 총동문회" };

const PAGE_SIZE = 20;

export default async function AlumniPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; year?: string; dept?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.status === "PENDING" || session.user.status === "REJECTED") {
    redirect("/pending");
  }

  const { name, year, dept, page = "1" } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const userWhere: Prisma.UserWhereInput = {
    status: { in: ["APPROVED", "ADMIN"] },
  };
  if (name) userWhere.name = { contains: name, mode: "insensitive" };

  const where: Prisma.AlumniProfileWhereInput = { user: userWhere };
  if (year && !isNaN(Number(year))) where.graduationYear = Number(year);
  if (dept) where.department = { contains: dept, mode: "insensitive" };

  const [total, members, yearOptions, deptOptions] = await Promise.all([
    prisma.alumniProfile.count({ where }),
    prisma.alumniProfile.findMany({
      where,
      include: { user: { select: { name: true, image: true } } },
      orderBy: [{ graduationYear: "asc" }, { id: "asc" }],
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.alumniProfile.findMany({
      select: { graduationYear: true },
      distinct: ["graduationYear"],
      orderBy: { graduationYear: "asc" },
    }),
    prisma.alumniProfile.findMany({
      select: { department: true },
      distinct: ["department"],
      orderBy: { department: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="section-title">동문 명부</h1>
      <div className="section-divider" />

      {/* 검색/필터 */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          name="name"
          defaultValue={name}
          placeholder="이름 검색"
          className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-40"
        />
        <select
          name="year"
          defaultValue={year}
          className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        >
          <option value="">졸업년도 전체</option>
          {yearOptions.map((y) => (
            <option key={y.graduationYear} value={y.graduationYear}>
              {y.graduationYear}년
            </option>
          ))}
        </select>
        <select
          name="dept"
          defaultValue={dept}
          className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        >
          <option value="">학과 전체</option>
          {deptOptions.filter((d) => d.department).map((d) => (
            <option key={d.department!} value={d.department!}>
              {d.department}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          검색
        </button>
        {(name || year || dept) && (
          <Link
            href="/alumni"
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
          >
            초기화
          </Link>
        )}
      </form>

      {/* 결과 수 */}
      <p className="text-sm text-muted-foreground mb-4">총 {total}명</p>

      {/* 목록 */}
      {members.length === 0 ? (
        <p className="text-center text-muted-foreground py-16 text-sm">
          검색 결과가 없습니다.
        </p>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">이름</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">졸업년도</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">학과</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                  전화번호
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {m.user.image ? (
                        <img
                          src={m.user.image}
                          alt={m.user.name ?? ""}
                          className="w-7 h-7 rounded-full shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0">
                          {m.user.name?.[0] ?? "?"}
                        </div>
                      )}
                      <span className="font-medium">{m.user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.graduationYear}년</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.department}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {m.phone}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination page={currentPage} totalPages={totalPages} baseUrl="/alumni" />
        </div>
      )}
    </div>
  );
}
