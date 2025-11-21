import { Feed } from "@/app/feed/Feed";

type Params = { sido_cd: string };

export default async function DetailPage({ params }: { params: Promise<Params> }) {
  const { sido_cd } = await params;

  return <Feed sido_cd={sido_cd} />;
}
