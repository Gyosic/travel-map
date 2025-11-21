import { HistoryForm, UnauthHistoryForm } from "@/components/shared/HistoryForm";
import { auth } from "@/lib/auth";

export default async function PostPage() {
  const session = await auth();

  return session ? <HistoryForm user_id={session.user.id as string} /> : <UnauthHistoryForm />;
}
