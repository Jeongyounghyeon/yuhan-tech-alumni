import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user
    ? { name: session.user.name, image: session.user.image, status: session.user.status }
    : null;

  return (
    <>
      <Header
        user={user}
        signOutButton={
          user ? (
            <SignOutButton className="text-sm text-muted-foreground hover:text-primary transition-colors" />
          ) : null
        }
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
