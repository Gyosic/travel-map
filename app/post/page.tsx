import { redirect } from "next/navigation";
import HistoryForm from "@/components/shared/HistoryForm";
import { auth } from "@/lib/auth";

export default async function PostPage() {
  const session = await auth();
  if (!session) redirect("/");

  return <HistoryForm />;
}
