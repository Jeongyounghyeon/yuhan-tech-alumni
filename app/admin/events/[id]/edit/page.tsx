import { prisma } from "@/lib/prisma";
import { updateEvent } from "@/app/actions/admin";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "행사 수정 | 관리자" };

const INPUT =
  "w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white";

function toDatetimeLocal(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id: Number(id) } });
  if (!event) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/events" className="text-sm text-muted-foreground hover:text-primary">
          ← 목록
        </Link>
        <h1 className="text-xl font-bold">행사 수정</h1>
      </div>

      <form action={updateEvent} className="flex flex-col gap-4 bg-white border border-border rounded-xl p-6">
        <input type="hidden" name="id" value={event.id} />
        <div>
          <label className="block text-sm font-medium mb-1.5">제목</label>
          <input
            type="text"
            name="title"
            required
            defaultValue={event.title}
            className={INPUT}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">시작 일시</label>
            <input
              type="datetime-local"
              name="startDate"
              required
              defaultValue={toDatetimeLocal(event.startDate)}
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">종료 일시</label>
            <input
              type="datetime-local"
              name="endDate"
              required
              defaultValue={toDatetimeLocal(event.endDate)}
              className={INPUT}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">장소</label>
          <input
            type="text"
            name="location"
            defaultValue={event.location ?? ""}
            className={INPUT}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">설명</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={event.description ?? ""}
            className={`${INPUT} resize-none`}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Link
            href="/admin/events"
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
}
