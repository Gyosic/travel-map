import { isNil } from "es-toolkit";
import z from "zod";

export const userFormSchema = z.object({
  email: z
    .string({
      error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
    })
    .min(1, "필수 입력값 입니다."),
  password: z
    .string({
      error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
    })
    .min(1, "필수 입력값 입니다."),
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
});

export const userSchema = userFormSchema.omit({ password: true, confirmPassword: true }).extend({
  _id: z.number(),
  is_sysadmin: z.boolean().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type UserType = z.infer<typeof userSchema>;
