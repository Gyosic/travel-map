import { redirect } from "next/navigation";
import { SignupForm } from "@/components/shared/SignupForm";
import { auth } from "@/lib/auth";

export default async function SignupPage() {
  const session = await auth();
  if (session) redirect("/");

  return <SignupForm />;
}
