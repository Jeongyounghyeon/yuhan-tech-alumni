import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

const QUICK_MENUS = [
  { href: "/notices", label: "공지사항", icon: "📢" },
  { href: "/board", label: "자유게시판", icon: "💬" },
  { href: "/alumni", label: "동문 명부", icon: "👥" },
  { href: "/events", label: "행사 일정", icon: "📅" },
  { href: "/gallery", label: "갤러리", icon: "🖼" },
  { href: "/officers", label: "임원진", icon: "🏅" },
  { href: "/scholarship", label: "장학회", icon: "🎓" },
];

const HISTORY = [
  { year: "1964", desc: "유한공업고등학교 설립" },
  { year: "1970", desc: "총동문회 창설" },
  { year: "1990", desc: "장학회 설립" },
  { year: "2000", desc: "총동문회관 건립" },
  { year: "2024", desc: "창립 60주년 기념행사" },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const notices = await prisma.notice.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, title: true, createdAt: true },
  });

  return (
    <>
      {/* 히어로 */}
      <section className="bg-primary text-primary-foreground py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs tracking-[0.3em] text-primary-foreground/70 mb-4 uppercase">
            Yuhan Technical High School Alumni
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
            유한공업고등학교<br />총동문회
          </h1>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            유일한 박사의 숭고한 정신을 이어받아<br />
            동문 간의 유대와 발전을 도모합니다.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/alumni"
              className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-6 py-2.5 rounded-lg font-medium hover:bg-primary-foreground/90 transition-colors"
            >
              동문 명부 보기 →
            </Link>
            <Link
              href="/notices"
              className="inline-flex items-center gap-2 border border-primary-foreground/40 text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary-foreground/10 transition-colors"
            >
              공지사항
            </Link>
          </div>
        </div>
      </section>

      {/* 설립정신 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title justify-center text-center">설립정신</h2>
          <div className="section-divider mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            {[
              { title: "창립 정신", desc: "유일한 박사의 나라와 민족을 위한 헌신 정신을 계승합니다." },
              { title: "기술 연마", desc: "실력 있는 기술인 육성을 통해 산업 발전에 기여합니다." },
              { title: "사회 봉사", desc: "동문 간 유대를 바탕으로 사회에 봉사하고 기여합니다." },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-xl bg-accent border border-border text-center">
                <h3 className="font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 연혁 */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title">연혁</h2>
          <div className="section-divider" />
          <div className="flex flex-col gap-4 max-w-lg">
            {HISTORY.map((item) => (
              <div key={item.year} className="flex items-start gap-4">
                <span className="text-primary font-bold w-12 shrink-0">{item.year}</span>
                <span className="text-foreground/80">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 공지사항 미리보기 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-2">
            <h2 className="section-title">공지사항</h2>
            <Link href="/notices" className="text-sm text-primary hover:underline">
              더보기 →
            </Link>
          </div>
          <div className="section-divider" />
          {notices.length === 0 ? (
            <p className="text-muted-foreground text-sm">등록된 공지사항이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-border">
              {notices.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/notices/${n.id}`}
                    className="flex items-center justify-between py-3 hover:text-primary transition-colors"
                  >
                    <span className="text-sm truncate">{n.title}</span>
                    <span className="text-xs text-muted-foreground ml-4 shrink-0">
                      {formatDate(n.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 빠른 메뉴 */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title justify-center text-center">빠른 메뉴</h2>
          <div className="section-divider mx-auto" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4 mt-2">
            {QUICK_MENUS.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-border hover:border-primary hover:shadow-sm transition-all"
              >
                <span className="text-2xl">{menu.icon}</span>
                <span className="text-xs font-medium text-center">{menu.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
