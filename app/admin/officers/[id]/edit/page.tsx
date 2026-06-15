import { prisma } from "@/lib/prisma";
import { updateOfficer } from "@/app/actions/admin";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "임원 수정 | 관리자" };

const INPUT =
  "w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white";

export default async function EditOfficerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const officer = await prisma.officer.findUnique({ where: { id: Number(id) } });
  if (!officer) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/officers" className="text-sm text-muted-foreground hover:text-primary">
          ← 목록
        </Link>
        <h1 className="text-xl font-bold">임원 수정</h1>
      </div>

      <form action={updateOfficer} className="flex flex-col gap-4 bg-white border border-border rounded-xl p-6">
        <input type="hidden" name="id" value={officer.id} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">이름</label>
            <input type="text" name="name" required defaultValue={officer.name} className={INPUT} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">직책</label>
            <input type="text" name="position" required defaultValue={officer.position} className={INPUT} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">졸업연도</label>
            <input
              type="number"
              name="graduationYear"
              defaultValue={officer.graduationYear ?? ""}
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">순서</label>
            <input type="number" name="order" defaultValue={officer.order} className={INPUT} />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Link
            href="/admin/officers"
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
