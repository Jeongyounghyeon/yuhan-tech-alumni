import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "장학회 | 유한공업고등학교 총동문회" };

export default async function ScholarshipPage() {
  const [info, scholarships] = await Promise.all([
    prisma.scholarshipInfo.findUnique({ where: { id: 1 } }),
    prisma.scholarship.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="section-title">장학회</h1>
      <div className="section-divider" />

      {info && (
        <p className="text-muted-foreground mb-10 leading-relaxed max-w-2xl">{info.description}</p>
      )}

      <h2 className="text-lg font-bold mb-4">장학 안내</h2>
      {scholarships.length === 0 ? (
        <p className="text-muted-foreground text-sm">등록된 장학 정보가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scholarships.map((s) => (
            <div key={s.id} className="p-6 rounded-xl border border-border bg-white hover:shadow-sm transition-shadow">
              <h3 className="font-bold text-foreground mb-3">{s.name}</h3>
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-16 shrink-0">지원금액</span>
                  <span className="font-medium text-primary">{s.amount}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-16 shrink-0">지원기간</span>
                  <span>{s.period}</span>
                </div>
                {s.description && (
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{s.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
