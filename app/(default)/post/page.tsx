"use client";

import { useSession } from "next-auth/react";
import { HistoryForm, UnauthHistoryForm } from "@/components/shared/HistoryForm";

export default function PostPage() {
  const { data: session } = useSession();

  return session ? <HistoryForm user_id={session.user.id as string} /> : <UnauthHistoryForm />;
}
