"use client";

import { useState } from "react";

type CalendarEvent = {
  id: string;
  title: string;
  start: string; // "YYYY-MM-DD HH:mm"
  end: string;
  description?: string;
  location?: string;
};

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function EventsCalendar({ events }: { events: CalendarEvent[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-indexed

  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }

  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

  const cells: { date: number; currentMonth: boolean; dateStr: string }[] = [];

  // 이전 달 채우기
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const [py, pm] = month === 1 ? [year - 1, 12] : [year, month - 1];
    cells.push({ date: d, currentMonth: false, dateStr: toDateStr(py, pm, d) });
  }
  // 현재 달
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: d, currentMonth: true, dateStr: toDateStr(year, month, d) });
  }
  // 다음 달 채우기 (6행 고정)
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const [ny, nm] = month === 12 ? [year + 1, 1] : [year, month + 1];
    cells.push({ date: d, currentMonth: false, dateStr: toDateStr(ny, nm, d) });
  }

  const eventsByDate: Record<string, CalendarEvent[]> = {};
  events.forEach((e) => {
    const key = e.start.slice(0, 10);
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(e);
  });

  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
  const monthEvents = events.filter((e) => e.start.startsWith(monthPrefix));

  const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());

  return (
    <div>
      {/* 캘린더 */}
      <div className="border border-border rounded-xl bg-white overflow-hidden">
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition-colors text-lg"
          >
            ‹
          </button>
          <span className="font-semibold text-base">
            {year}년 {String(month).padStart(2, "0")}월
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition-colors text-lg"
          >
            ›
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 border-t border-border">
          {DAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={`py-2 text-center text-sm font-medium ${
                i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-muted-foreground"
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 border-t border-border">
          {cells.map((cell, idx) => {
            const colIdx = idx % 7;
            const isToday = cell.currentMonth && cell.dateStr === todayStr;
            const isSun = colIdx === 0;
            const isSat = colIdx === 6;
            const cellEvents = eventsByDate[cell.dateStr] ?? [];
            const isLastRow = idx >= 35;

            return (
              <div
                key={idx}
                className={`min-h-[80px] p-2 border-r border-b border-border ${
                  colIdx === 6 ? "border-r-0" : ""
                } ${isLastRow ? "border-b-0" : ""} ${
                  !cell.currentMonth ? "bg-muted/20" : ""
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full ${
                    isToday
                      ? "bg-primary text-primary-foreground font-bold"
                      : !cell.currentMonth
                      ? "text-muted-foreground/40"
                      : isSun
                      ? "text-red-500"
                      : isSat
                      ? "text-blue-500"
                      : ""
                  }`}
                >
                  {cell.date}
                </span>
                {cellEvents.map((e) => (
                  <div
                    key={e.id}
                    className="mt-1 text-xs bg-primary/10 text-primary rounded px-1 py-0.5 truncate"
                    title={e.title}
                  >
                    {e.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* 이번 달 행사 목록 */}
      <div className="mt-8">
        <h2 className="font-bold text-lg mb-4">이번 달 행사</h2>
        {monthEvents.length === 0 ? (
          <p className="text-center text-muted-foreground py-10 text-sm">
            이번 달 등록된 행사가 없습니다.
          </p>
        ) : (
          <ul className="space-y-3">
            {monthEvents.map((e) => (
              <li key={e.id} className="flex gap-4 p-4 border border-border rounded-lg bg-white">
                <div className="text-primary font-semibold shrink-0 text-sm">
                  {e.start.slice(5, 10).replace("-", "/")}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{e.title}</p>
                  {e.location && (
                    <p className="text-xs text-muted-foreground mt-0.5">{e.location}</p>
                  )}
                  {e.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{e.description}</p>
                  )}
                </div>
                <div className="shrink-0 text-xs text-muted-foreground ml-auto">
                  {e.start.slice(11, 16)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
