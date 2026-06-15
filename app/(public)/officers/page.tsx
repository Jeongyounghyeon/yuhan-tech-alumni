import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "임원진 | 유한공업고등학교 총동문회" };

export default async function OfficersPage() {
  const officers = await prisma.officer.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="section-title">임원진</h1>
      <div className="section-divider" />

      {officers.length === 0 ? (
        <p className="text-muted-foreground text-sm">등록된 임원진이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {officers.map((o) => (
            <div key={o.id} className="flex flex-col items-center text-center p-6 rounded-xl border border-border bg-white hover:shadow-sm transition-shadow">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mb-4">
                {o.photoUrl ? (
                  <img src={o.photoUrl} alt={o.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  o.name[0]
                )}
              </div>
              <p className="font-bold text-foreground">{o.name}</p>
              <p className="text-sm text-primary mt-1">{o.position}</p>
              {o.graduationYear && (
                <p className="text-xs text-muted-foreground mt-1">{o.graduationYear}년 졸업</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
