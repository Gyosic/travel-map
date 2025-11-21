import { FileType } from "@/lib/schema/file";

declare global {
  interface File extends FileType {}
}
