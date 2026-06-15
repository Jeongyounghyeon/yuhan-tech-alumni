import { prisma } from "@/lib/prisma";
import { deleteEvent } from "@/app/actions/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "행사 일정 관리 | 관리자" };

function formatDatetime(date: Date) {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startDate: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">행사 일정 관리</h1>
        <Link
          href="/admin/events/new"
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          + 추가
        </Link>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">제목</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">장소</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">시작일시</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">종료일시</th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-sm">
                  등록된 행사가 없습니다.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{event.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{event.location ?? "-"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDatetime(event.startDate)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDatetime(event.endDate)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="px-3 py-1 text-xs border border-border rounded-lg hover:bg-accent transition-colors"
                      >
                        수정
                      </Link>
                      <form action={deleteEvent}>
                        <input type="hidden" name="id" value={event.id} />
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
