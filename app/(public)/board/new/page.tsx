import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createPost } from "@/app/actions/board";
import Link from "next/link";

export const metadata = { title: "글쓰기 | 유한공업고등학교 총동문회" };

export default async function BoardNewPage() {
  const session = await auth();
  if (!session || session.user.status !== "APPROVED") {
    redirect("/login");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/board" className="text-sm text-muted-foreground hover:text-primary">
          ← 목록으로
        </Link>
      </div>

      <h1 className="section-title mb-6">글쓰기</h1>

      <form action={createPost} className="flex flex-col gap-4">
        <div>
          <input
            type="text"
            name="title"
            required
            placeholder="제목을 입력하세요"
            maxLength={200}
            className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <textarea
            name="content"
            required
            rows={14}
            placeholder="내용을 입력하세요"
            className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          />
        </div>
        <div className="flex justify-end gap-3">
          <Link
            href="/board"
            className="px-6 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            등록
          </button>
        </div>
      </form>
    </div>
  );
}
