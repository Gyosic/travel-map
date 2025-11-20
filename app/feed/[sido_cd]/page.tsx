import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Feed } from "@/app/feed/Feed";
import { site } from "@/config";
import { auth } from "@/lib/auth";

type Params = { sido_cd: string };

const getHistories = async (sido_cd: string) => {
  const res = await fetch(`${site.baseurl}/api/histories`, {
    method: "POST",
    body: JSON.stringify({ where: [{ field: "sido_cd", operator: "eq", value: sido_cd }] }),
    headers: { cookie: (await cookies()).toString() },
  });

  const data = await res.json();

  return data.rows;
};

export default async function DetailPage({ params }: { params: Promise<Params> }) {
  const session = await auth();
  if (!session) redirect("/");

  const { sido_cd } = await params;
  const histories = await getHistories(sido_cd);

  return <Feed histories={histories} />;
}
