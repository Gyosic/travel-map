import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Feed } from "@/app/feed/Feed";
import { site } from "@/config";
import { auth } from "@/lib/auth";

const getHistories = async () => {
  const res = await fetch(`${site.baseurl}/api/histories`, {
    method: "POST",
    headers: { cookie: (await cookies()).toString() },
  });

  const data = await res.json();

  return data.rows;
};

export default async function DetailPage() {
  const session = await auth();
  if (!session) redirect("/");

  const histories = await getHistories();

  return <Feed histories={histories} />;
}
