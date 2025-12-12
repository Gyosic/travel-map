import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import FileSystem from "@/lib/fileSystem";
import { writeDb as db } from "@/lib/pg";
import { FileType } from "@/lib/schema/file";
import { historyFormSchema } from "@/lib/schema/history.schema";
import { histories } from "@/lib/schema/history.table";

const schema = historyFormSchema.extend({ _id: z.string({ message: "_id는 필수입력값 입니다." }) });

const storageName = "images";
const fileSystemService = new FileSystem();

type Params = { _id: string };

export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  const session = await auth();

  if (!session) return NextResponse.json("인증되지 않은 요청입니다.", { status: 401 });

  const { _id } = await params;

  const [row] = await db.select().from(histories).where(eq(histories._id, _id));

  (row.images as File[])?.forEach(async (image) => {
    await fileSystemService.unlink({ filepath: image.src });
  });

  await db.delete(histories).where(eq(histories._id, _id));

  return NextResponse.json("History deleted successfully");
}

export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
  const session = await auth();

  if (!session) return NextResponse.json("인증되지 않은 요청입니다.", { status: 401 });

  const { _id } = await params;

  try {
    const formData = await req.formData();
    const { images: _images, ...history } = Object.fromEntries(formData.entries());
    const allImages = formData.getAll("images");
    const images = (allImages.filter((v) => v instanceof File) ?? []) as File[];
    const originalImages = allImages
      .filter((v) => typeof v === "string")
      .map((v) => {
        try {
          return JSON.parse(v);
        } catch {
          return v;
        }
      })
      .flat() as string[];

    const parsed = await schema
      .omit({ images: true })
      .extend({
        rating: z.coerce.number().optional(),
        // lnglat을 [number, number] 튜플로 강제 변환 (string/number[] 모두 허용)
        lnglat: z.preprocess((v) => {
          try {
            const value = typeof v === "string" ? JSON.parse(v) : Array.isArray(v) ? v : null;

            if (Array.isArray(value) && value.length >= 2) {
              const x = Number(value[0]);
              const y = Number(value[1]);
              if (Number.isFinite(x) && Number.isFinite(y)) return [x, y];
            }
            return null;
          } catch {
            return null;
          }
        }, z.tuple([z.number(), z.number()]).nullable().optional()),
        tags: z.preprocess((v) => {
          try {
            const value = typeof v === "string" ? JSON.parse(v) : Array.isArray(v) ? v : undefined;
            if (Array.isArray(value)) return value;
            return undefined;
          } catch {
            return undefined;
          }
        }, z.array(z.string()).optional()),
      })
      .parseAsync(history);

    let result;
    const files: FileType[] = [];

    try {
      await db.transaction(async (tx) => {
        for (const image of images as File[]) {
          const buffer = await image.arrayBuffer();

          const filename = fileSystemService.genFilename();
          const src = `/${storageName}/${filename}`;
          files.push({
            name: image.name,
            lastModified: image.lastModified,
            type: image.type,
            size: image.size,
            src,
          });
          await fileSystemService.write({ filepath: src, content: Buffer.from(buffer) });
        }

        const rows = await tx
          .update(histories)
          .set({ ...parsed, images: [...originalImages, ...files], updated_at: new Date() })
          .where(eq(histories._id, _id))
          .returning();

        result = rows[0];
      });
    } catch (dbError) {
      // If transaction fails, clean up the uploaded file
      if (files.length > 0) {
        try {
          for (const { src } of files) {
            await fileSystemService.unlink({ filepath: src });
          }
        } catch (unlinkError) {
          console.error("Failed to cleanup file:", unlinkError);
        }
      }
      throw dbError;
    }

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.info(error);
    const { message, cause: { code, detail } = {} } = error as {
      message?: string;
      cause: { code?: string; detail?: string };
    };

    return NextResponse.json(
      { error: { status: 500, message: detail || message || error, code } },
      { status: !!code ? 400 : 500 },
    );
  }
}
