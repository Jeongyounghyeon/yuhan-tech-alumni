import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GalleryForm } from "@/components/features/GalleryForm";

export const metadata = { title: "갤러리 등록 | 유한공업고등학교 총동문회" };

export default async function GalleryNewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user.isAdmin) redirect("/");

  const { error } = await searchParams;

  return <GalleryForm mode="create" error={error} />;
}
