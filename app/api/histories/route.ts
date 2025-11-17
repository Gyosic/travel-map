import { and, ColumnDataType, count, eq, getTableColumns, Operators, sql } from "drizzle-orm";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, selectQuerying } from "@/lib/pg";
import { histories } from "@/lib/schema/history.table";
import { users } from "@/lib/schema/user.table";

const historyColumns = getTableColumns(histories);

type FilterType = {
  field: keyof typeof historyColumns;
  operator: keyof Operators;
  value: ColumnDataType;
  or?: boolean;
};
type BodyType = {
  where?: FilterType[];
  sort?: { id: keyof typeof historyColumns; desc: boolean }[];
  pagination?: { pageIndex: number; pageSize: number };
};

export async function POST(req: NextRequest & NextApiRequest) {
  let body: BodyType = {};
  try {
    body = await req.json();
  } catch {}

  const session = await auth();
  console.log(session);

  if (!session) return NextResponse.json("인증되지 않은 요청입니다.", { status: 401 });

  let query = db
    .select({ ...historyColumns })
    .from(histories)
    .leftJoin(users, eq(users.id, session.user.id!))
    .$dynamic();
  let totalQuery = db
    .select({ total: count() })
    .from(histories)
    .leftJoin(users, eq(users.id, session.user.id!))
    .$dynamic();

  const { whereCondition, orderCondition, pagingCondition } = selectQuerying(histories, body);

  const where = [whereCondition];

  query = query.where(and(...where));
  totalQuery = totalQuery.where(and(...where));

  if (orderCondition.length) query = query.orderBy(...orderCondition);

  if (pagingCondition) query = query.limit(pagingCondition.limit).offset(pagingCondition.offset);

  const rows = await query;

  const [{ total = 0 } = {}] = await totalQuery;

  return NextResponse.json({ rows, rowCount: total }, { status: 200 });
}
