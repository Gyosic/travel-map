import { z } from "zod";

export const extensionToMime: Record<string, string> = {
  // 이미지
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  jpe: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  tiff: "image/tiff",
  tif: "image/tiff",
  svg: "image/svg+xml",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
  ico: "image/x-icon",

  // 문서
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  csv: "text/csv",
  rtf: "application/rtf",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",

  // 코드 / 데이터
  json: "application/json",
  xml: "application/xml",
  html: "text/html",
  js: "text/javascript",
  css: "text/css",

  // 압축 / 기타
  zip: "application/zip",
  rar: "application/vnd.rar",
  "7z": "application/x-7z-compressed",
  tar: "application/x-tar",
  gz: "application/gzip",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  mp4: "video/mp4",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
};

export default z.object({
  dirname: z.string(),
  size: z.number(),
  mime: z.string(),
  name: z.string(),
});

export const fileSchema = z.object({
  name: z.string(),
  lastModified: z.number(),
  type: z.string(),
  size: z.number(),
  src: z.string(),
});

export type FileType = z.infer<typeof fileSchema>;
