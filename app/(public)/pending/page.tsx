import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const metadata = { title: "승인 대기 | 유한공업고등학교 총동문회" };

export default async function PendingPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.status === "APPROVED" || session.user.status === "ADMIN") {
    redirect("/");
  }

  const isRejected = session.user.status === "REJECTED";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="text-5xl mb-6">{isRejected ? "❌" : "⏳"}</div>
        <h1 className="text-2xl font-bold text-primary mb-3">
          {isRejected ? "가입 승인 거절" : "승인 대기 중"}
        </h1>
        <p className="text-muted-foreground mb-2">
          {session.user.name}님, 안녕하세요.
        </p>
        {isRejected ? (
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            가입 신청이 거절되었습니다.<br />
            문의사항은 총동문회 사무국으로 연락 바랍니다.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            가입 신청이 완료되었습니다.<br />
            관리자 승인 후 동문 전용 기능을 이용하실 수 있습니다.<br />
            승인까지 다소 시간이 소요될 수 있습니다.
          </p>
        )}

        <div className="p-4 bg-muted/40 rounded-xl text-sm text-muted-foreground mb-8">
          <p className="font-medium text-foreground mb-1">문의</p>
          <p>유한공업고등학교 총동문회 사무국</p>
        </div>

        <SignOutButton className="text-sm text-muted-foreground hover:text-primary underline underline-offset-2 transition-colors" />
      </div>
    </div>
  );
}
