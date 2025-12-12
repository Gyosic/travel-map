import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/email-verification";
import { db } from "@/lib/pg";
import { users } from "@/lib/schema/user.table";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 400 });
    }

    // 토큰 검증 및 이메일 추출
    const email = await verifyToken(token);

    if (!email) {
      return NextResponse.json({ error: "유효하지 않거나 만료된 토큰입니다." }, { status: 400 });
    }

    // emailVerified 업데이트
    await db.update(users).set({ emailVerified: new Date() }).where(eq(users.email, email));

    return NextResponse.json({
      success: true,
      message: "이메일 인증이 완료되었습니다. 이제 로그인할 수 있습니다.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json({ error: "이메일 인증 중 오류가 발생했습니다." }, { status: 500 });
  }
}
