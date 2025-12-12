import crypto from "crypto";
import { eq } from "drizzle-orm";
import { isNil } from "es-toolkit/compat";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { hmacEncrypt } from "@/lib/encryption";
import { db } from "@/lib/pg";
import { users } from "@/lib/schema/user.table";

const schema = z
  .object({
    email: z
      .string({
        error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
      })
      .min(1, "필수 입력값 입니다."),
    currentPassword: z
      .string({
        error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
      })
      .min(1, "필수 입력값 입니다."),
    password: z
      .string({
        error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
      })
      .min(1, "필수 입력값 입니다.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]{8,}$/,
        "영문자, 숫자, 특수문자를 포함한 8자 이상의 비밀번호를 입력해주세요.",
      ),
    confirmPassword: z
      .string({
        error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
      })
      .min(1, "필수 입력값 입니다."),
    oauth: z.boolean().optional(),
  })
  .refine(
    async (data) => {
      const [row] = await db.select().from(users).where(eq(users.email, data.email));

      const encryptedCurrentPassword = hmacEncrypt(data.currentPassword, row.salt!);

      return row.password === encryptedCurrentPassword;
    },
    {
      message: "현재 비밀번호가 일치하지 않습니다.",
      path: ["currentPassword"],
    },
  )
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    { message: "비밀번호가 일치하지 않습니다.", path: ["confirmPassword"] },
  );

export async function PUT(req: NextRequest) {
  try {
    const { oauth, ...body } = await req.json();

    if (oauth) {
      const { email, password } = await schema.omit({ currentPassword: true }).parseAsync(body);

      const salt = crypto.randomBytes(64).toString("base64");
      const encryptedPassword = hmacEncrypt(password, salt);

      await db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({ password: encryptedPassword, salt })
          .where(eq(users.email, email));
      });
    } else {
      const { email, password } = await schema.parseAsync(body);
      const [user] = await db.select().from(users).where(eq(users.email, email));

      const encryptedPassword = hmacEncrypt(password, user.salt!);

      await db.transaction(async (tx) => {
        await tx.update(users).set({ password: encryptedPassword }).where(eq(users.email, email));
      });
    }

    return NextResponse.json({ message: "비밀번호가 성공적으로 변경되었습니다." }, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const [{ message } = {}] = JSON.parse((err as z.ZodError)?.message || "[]");

      return NextResponse.json(message, { status: 400 });
    }

    const { cause: { code, detail } = {} } = err as { cause: { code?: string; detail?: string } };

    return NextResponse.json(
      { error: { status: 500, message: detail || err, code } },
      { status: !!code ? 400 : 500 },
    );
  }
}
