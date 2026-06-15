import { createNotice } from "@/app/actions/admin";
import Link from "next/link";

export const metadata = { title: "공지사항 작성 | 관리자" };

const INPUT =
  "w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white";

export default async function NewNoticePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/notices" className="text-sm text-muted-foreground hover:text-primary">
          ← 목록
        </Link>
        <h1 className="text-xl font-bold">공지사항 작성</h1>
      </div>

      {error === "missing" && (
        <p className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
          제목과 내용을 모두 입력해주세요.
        </p>
      )}

      <form action={createNotice} className="flex flex-col gap-4 bg-white border border-border rounded-xl p-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">제목</label>
          <input type="text" name="title" required className={INPUT} placeholder="공지사항 제목" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">내용</label>
          <textarea
            name="content"
            required
            rows={12}
            className={`${INPUT} resize-none`}
            placeholder="공지사항 내용을 입력하세요"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Link
            href="/admin/notices"
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            등록
          </button>
        </div>
      </form>
    </div>
  );
}
