import { z } from "zod";

export default z.object({
  dirname: z.string(),
  size: z.number(),
  mime: z.string(),
  name: z.string(),
});

export const fileSchema = z.object({
  filename: z.string(),
  lastModified: z.number(),
  type: z.string(),
  originalname: z.string(),
  size: z.number(),
  src: z.string(),
});

export type FileType = z.infer<typeof fileSchema>;
