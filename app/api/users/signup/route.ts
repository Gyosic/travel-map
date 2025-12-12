import crypto from "crypto";
import { count, eq } from "drizzle-orm";
import { isNil } from "es-toolkit/compat";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { createVerificationToken } from "@/lib/auth/email-verification";
import { sendVerificationEmail } from "@/lib/email";
import { hmacEncrypt } from "@/lib/encryption";
import { db } from "@/lib/pg";
import { userFormSchema } from "@/lib/schema/user.schema";
import { users } from "@/lib/schema/user.table";

const schema = userFormSchema.safeExtend({
  email: z
    .string({
      error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
    })
    .min(1, "필수 입력값 입니다.")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "유효하지 않은 이메일 형식입니다.")
    .refine(async (email) => {
      const [{ count: countValue = 0 } = {}] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      return countValue === 0;
    }, "이미 존재하는 이메일 입니다."),
});
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, confirmPassword: _, ...user } = await schema.parseAsync(body);

    const salt = crypto.randomBytes(64).toString("base64");
    const encryptedPassword = hmacEncrypt(password, salt);

    // 회원가입 처리
    await db.transaction(async (tx) => {
      // 이메일 인증 토큰 생성
      const token = await createVerificationToken(user.email);

      // 인증 이메일 발송
      await sendVerificationEmail(user.email, token);

      await tx.insert(users).values({
        password: encryptedPassword,
        salt,
        ...user,
        // emailVerified는 NULL로 설정됨 (기본값)
      });
    });

    return NextResponse.json(
      { message: "회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요." },
      { status: 201 },
    );
  } catch (err) {
    const { cause: { code, detail } = {} } = err as { cause: { code?: string; detail?: string } };

    return NextResponse.json(
      { error: { status: 500, message: detail || err, code } },
      { status: !!code ? 400 : 500 },
    );
  }
}
