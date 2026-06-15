import { prisma } from "@/lib/prisma";
import { EventsCalendar } from "@/components/features/EventsCalendar";

export const dynamic = "force-dynamic";
export const metadata = { title: "행사 일정 | 유한공업고등학교 총동문회" };

export default async function EventsPage() {
  const events = await prisma.event.findMany({ orderBy: { startDate: "asc" } });

  const calendarEvents = events.map((e) => ({
    id: String(e.id),
    title: e.title,
    start: e.startDate.toISOString().slice(0, 16).replace("T", " "),
    end: e.endDate.toISOString().slice(0, 16).replace("T", " "),
    description: e.description ?? undefined,
    location: e.location ?? undefined,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="section-title">행사 일정</h1>
      <div className="section-divider" />
      <EventsCalendar events={calendarEvents} />
    </div>
  );
}
