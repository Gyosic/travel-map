import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HistoryUpdateForm } from "@/components/shared/HistoryForm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/pg";
import { HistoryType } from "@/lib/schema/history.schema";
import { histories } from "@/lib/schema/history.table";

type Params = { _id: string };

const getHistory = async (_id: string) => {
  const [history] = await db.select().from(histories).where(eq(histories._id, _id));

  return history as HistoryType;
};

export default async function PostUpdatePage({ params }: { params: Promise<Params> }) {
  const session = await auth();

  if (!session) {
    const referer = (await headers()).get("referer");
    if (referer) return redirect(referer || "/");
  }

  const { _id } = await params;

  const history = await getHistory(_id);

  return <HistoryUpdateForm user_id={session?.user.id as string} history={history} />;
}
