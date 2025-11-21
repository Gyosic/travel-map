import z from "zod";
import { fileSchema } from "@/lib/schema/file";
import { Model } from "@/lib/schema/model";

export const historyFormModel: Record<string, Model> = {
  title: { name: "제목", type: "text", required: true },
  date: {
    name: "날짜",
    type: "date",
    required: true,
    default: new Date().toISOString().slice(0, 10),
  },
  content: { name: "내용", type: "textarea", required: true },
  address: { name: "주소", type: "address" },
  rating: { name: "만족도", type: "rating" },
  images: {
    name: "사진",
    type: "file",
    multiple: true,
    accept: ["jpg", "jpeg", "png", "gif", "bmp", "webp"],
  },
  tags: { name: "태그", type: "tag" },
};
export const historyFormSchema = z.object({
  title: z.string({ message: "제목을 입력해주세요." }).min(1, { message: "제목을 입력해주세요." }),
  date: z.string(),
  content: z
    .string({ message: "내용을 입력해주세요." })
    .min(1, { message: "내용을 입력해주세요." }),
  address: z.string().optional(),
  sido_cd: z.string().optional(),
  sgg_cd: z.string().optional(),
  emd_cd: z.string().optional(),
  lnglat: z.array(z.number()).optional(),
  rating: z.number().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.instanceof(File).or(fileSchema)).optional(),
  user_id: z.string({ message: "user_id는 필수입력값 입니다." }),
});
export type HistoryFormType = z.infer<typeof historyFormSchema>;

export const historySchema = historyFormSchema.extend({
  _id: z.string(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});
export type HistoryType = z.infer<typeof historySchema>;
