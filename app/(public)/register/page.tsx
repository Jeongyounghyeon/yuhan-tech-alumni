import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { register } from "@/app/actions/auth";
import Link from "next/link";

export const metadata = { title: "회원가입 | 유한공업고등학교 총동문회" };

const ERROR_MESSAGES: Record<string, string> = {
  missing: "모든 항목을 입력해주세요.",
  exists: "이미 가입된 이메일입니다. 로그인 페이지를 이용해주세요.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/");

  const { error } = await searchParams;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">회원가입</h1>
          <p className="text-sm text-muted-foreground">
            가입 후 관리자 승인이 완료되면 이용 가능합니다
          </p>
        </div>

        {error && ERROR_MESSAGES[error] && (
          <div className="mb-5 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-200">
            {ERROR_MESSAGES[error]}
          </div>
        )}

        <form action={register} className="flex flex-col gap-3">
          <input
            type="text"
            name="name"
            required
            placeholder="이름 (실명)"
            className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="이메일 (아이디)"
            className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <input
            type="password"
            name="password"
            required
            minLength={8}
            placeholder="비밀번호 (8자 이상)"
            className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <input
            type="number"
            name="graduationYear"
            required
            min={1964}
            max={new Date().getFullYear()}
            placeholder="졸업연도 (예: 1995)"
            className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <input
            type="text"
            name="department"
            required
            placeholder="학과 (예: 기계과)"
            className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />

          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors mt-1"
          >
            가입 신청
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-5 leading-relaxed">
          관리자가 이름과 졸업연도를 확인 후 승인합니다.
        </p>

        <p className="text-center text-sm mt-4 text-muted-foreground">
          이미 회원이신가요?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
