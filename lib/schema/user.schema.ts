import { isNil } from "es-toolkit";
import z from "zod";

export const userFormModel = {
  name: { name: "이름", type: "text", required: true },
  email: { name: "이메일", type: "text", required: true, unique: true },
  password: { name: "비밀번호", type: "password", required: true },
  confirmPassword: { name: "비밀번호 확인", type: "password", required: true },
};

export const userFormSchema = z
  .object({
    email: z
      .string({
        error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
      })
      .min(1, "필수 입력값 입니다.")
      .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "유효하지 않은 이메일 형식입니다.",
      ),
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
    name: z
      .string({
        error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
      })
      .min(1, "필수 입력값 입니다."),
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    { message: "비밀번호가 일치하지 않습니다.", path: ["confirmPassword"] },
  );

export const userSchema = userFormSchema.omit({ password: true, confirmPassword: true }).extend({
  _id: z.number(),
  is_sysadmin: z.boolean().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type UserFormType = z.infer<typeof userFormSchema>;

export type UserType = z.infer<typeof userSchema>;
