import { eq, getTableColumns } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/pg";
import { users } from "@/lib/schema/user.table";

const userColumns = getTableColumns(users);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  const value = searchParams.get("value");

  if (!key || !value)
    return NextResponse.json({ error: "Key and value are required" }, { status: 400 });

  if (!(key in userColumns)) {
    return NextResponse.json(
      { error: "users 테이블에 존재하지 않는 key 입니다." },
      { status: 400 },
    );
  }

  const column = userColumns[key as keyof typeof userColumns];

  const [user = null] = await db.select().from(users).where(eq(column, value));

  return NextResponse.json(user);
}

export async function POST(req: NextRequest) {
  const { email, type } = await req.json();

  if (type === "first-oauth-login") {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    return NextResponse.json(!!user.password);
  }

  return NextResponse.json(false);
}
