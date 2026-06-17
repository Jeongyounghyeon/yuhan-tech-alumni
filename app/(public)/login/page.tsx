import { auth, signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "로그인 | 유한공업고등학교 총동문회" };

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "승인이 거절된 계정입니다. 총동문회 사무국에 문의하세요.",
  CredentialsSignin: "이메일 또는 비밀번호가 올바르지 않습니다.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string; registered?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/");

  const { error, callbackUrl = "/", registered } = await searchParams;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">로그인</h1>
          <p className="text-sm text-muted-foreground">
            유한공업고등학교 총동문회 회원 전용
          </p>
        </div>

        {registered && (
          <div className="mb-5 p-3 bg-green-50 text-green-700 text-sm rounded-lg text-center border border-green-200">
            가입 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.
          </div>
        )}

        {error && ERROR_MESSAGES[error] && (
          <div className="mb-5 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-200">
            {ERROR_MESSAGES[error]}
          </div>
        )}

        <form
          action={async (formData: FormData) => {
            "use server";
            try {
              await signIn("credentials", {
                email: formData.get("email"),
                password: formData.get("password"),
                redirectTo: callbackUrl,
              });
            } catch (error) {
              if (error instanceof AuthError) {
                redirect(`/login?error=${error.type}`);
              }
              throw error;
            }
          }}
          className="flex flex-col gap-3"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="이메일"
            className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <input
            type="password"
            name="password"
            required
            placeholder="비밀번호"
            className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            로그인
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-muted-foreground">
          아직 회원이 아니신가요?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            회원가입
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground mt-3 leading-relaxed">
          최초 가입 후 관리자 승인이 완료되어야<br />동문 전용 기능을 이용하실 수 있습니다.
        </p>
      </div>
    </div>
  );
}
