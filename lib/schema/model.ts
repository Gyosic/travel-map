import { z } from "zod";
import { extensionToMime } from "@/lib/schema/file";

export const dataTypes = [
  { label: "문자", value: "text" },
  { label: "비밀번호", value: "password" },
  { label: "참/거짓", value: "boolean" },
  { label: "선택", value: "enum" },
  { label: "숫자", value: "number" },
  { label: "날짜", value: "date" },
  { label: "파일", value: "file" },
  { label: "라디오", value: "radio" },
  { label: "주소", value: "address" },
  { label: "문자영역", value: "textarea" },
  { label: "체크박스", value: "checkbox" },
  { label: "만족도", value: "rating" },
];

export const dataTypeOptions: Record<string, Record<string, Model>> = {
  text: {
    unique: { name: "고유값", type: "boolean", default: false },
    pattern: { name: "패턴", type: "text" },
    regexp: { name: "정규식", type: "text" },
    min: { name: "최소길이", type: "number" },
    max: { name: "최대길이", type: "number" },
  },
  string: {
    unique: { name: "고유값", type: "boolean", default: false },
    pattern: { name: "패턴", type: "text" },
    regexp: { name: "정규식", type: "text" },
    min: { name: "최소길이", type: "number" },
    max: { name: "최대길이", type: "number" },
  },
  number: {
    max: { name: "최대값", type: "number" },
    min: { name: "최소값", type: "number" },
    step: { name: "단계", type: "text" },
    precision: { name: "소숫점", type: "text" },
  },
  file: {
    accept: {
      name: "파일형식",
      type: "checkbox",
      enums: extensionToMime,
    },
    default: { name: "기본값", type: "array", items: { name: "파일", type: "file" } },
    multiple: { name: "다중선택", type: "boolean", default: false },
  },
  date: { format: { name: "날짜포맷", type: "text" } },
  enum: {
    multiple: { name: "다중선택", type: "boolean", default: false },
    enums: { name: "옵션", type: "record" },
  },
};

export const model = z
  .object({
    name: z.string(),
    type: z.string(),
    required: z.boolean().optional(),
    unique: z.boolean().optional(),
    default: z.unknown().optional(),
    pattern: z.string().optional(),
    format: z.string().optional(),
    regexp: z.instanceof(RegExp).optional(),
    max: z.number().optional(),
    min: z.number().optional(),
    step: z.number().optional(),
    precision: z.number().optional(),
    multiple: z.boolean().optional(),
    desc: z.string().optional(),
    placeholder: z.string().optional(),
    enums: z.record(z.string(), z.unknown()).optional(),
    accept: z.array(z.string()).optional(),
    unit: z.string().optional(),
    readOnly: z.boolean().optional(),
    order: z.number().optional(),
    onBlur: z.any().optional(),
    refine: z.any().optional(),
    searchInput: z.boolean().optional(),
    lte: z.boolean().optional(),
    lt: z.boolean().optional(),
    gte: z.boolean().optional(),
    gt: z.boolean().optional(),
    range: z.boolean().optional(),
    errors: z.record(z.string(), z.string()).optional(),
  })
  .catchall(z.unknown());

export type Model = z.infer<typeof model>;
