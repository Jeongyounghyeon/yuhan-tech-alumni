import { signOut } from "@/lib/auth";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button type="submit" className={className}>
        로그아웃
      </button>
    </form>
  );
}
