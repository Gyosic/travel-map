import { type NextRequest, NextResponse } from "next/server";
import z from "zod";
import { auth } from "@/lib/auth";
import FileSystem from "@/lib/fileSystem";
import { writeDb as db } from "@/lib/pg";
import { HistoryFormType, historyFormSchema } from "@/lib/schema/history.schema";
import { histories } from "@/lib/schema/history.table";

const storageName = "images";
const fileSystemService = new FileSystem();
const schema = z.object({
  histories: z.array(
    historyFormSchema.extend({
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
    }),
  ),
});

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session) return NextResponse.json("인증되지 않은 요청입니다.", { status: 401 });

  try {
    const body = await req.json();
    const historyValues = body.map((history: HistoryFormType) => ({
      ...history,
      user_id: session.user.id,
    }));

    const { histories: parsedHistories } = await schema.parseAsync({ histories: historyValues });

    const values = parsedHistories.map((history) => {
      const imagePaths = (history?.images ?? []) as File[];
      const images = imagePaths.map((image) => {
        const from = image.src;
        const to = from.replace("/tmp", `/${storageName}`);
        try {
          fileSystemService.rename({ from, to });
        } catch {}
        return { ...image, src: to };
      });

      return { ...history, images };
    });

    let result;

    try {
      await db.transaction(async (tx) => {
        const res = await tx.insert(histories).values(values);
        result = res;
      });
    } catch (dbError) {
      // If transaction fails, clean up the uploaded file
      values.forEach(async (value) => {
        if (value.images.length > 0) {
          try {
            for (const image of value.images) {
              const from = image.src;
              const to = from.replace(`/${storageName}`, "/tmp");
              fileSystemService.rename({ from, to });
            }
          } catch (renameError) {
            console.error("Failed to cleanup file:", renameError);
          }
        }
      });

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
