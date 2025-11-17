import { type NextRequest, NextResponse } from "next/server";
import z from "zod";
import { auth } from "@/lib/auth";
import FileSystem from "@/lib/fileSystem";
import { writeDb as db } from "@/lib/pg";
import { historyFormSchema } from "@/lib/schema/history.schema";
import { histories } from "@/lib/schema/history.table";

const storageName = "files";
const fileSystemService = new FileSystem({ storageName });

// Disable Next.js body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session) return NextResponse.json("인증되지 않은 요청입니다.", { status: 401 });

  try {
    const formData = await req.formData();
    const { images: _images, ...history } = Object.fromEntries(formData.entries());
    const images = formData.getAll("images") as File[];

    const parsed = await historyFormSchema
      .omit({ images: true })
      .extend({ rating: z.coerce.number() })
      .parseAsync(history);

    let result;
    const files: string[] = [];

    try {
      await db.transaction(async (tx) => {
        // Ensure "images" is always an array
        // let imagesArray: File[] = [];
        // const imagesRaw = images;

        // if (Array.isArray(imagesRaw)) {
        //   imagesArray = imagesRaw.filter((img) => img instanceof File) as File[];
        // } else if (imagesRaw instanceof File) {
        //   imagesArray = [imagesRaw];
        // } else if (imagesRaw !== undefined) {
        //   // Some clients may send as string or single object
        //   // Try to coerce if possible
        //   if (typeof imagesRaw === "object" && "arrayBuffer" in imagesRaw) {
        //     imagesArray = [imagesRaw as File];
        //   }
        // }

        for (const image of images as File[]) {
          const buffer = await image.arrayBuffer();

          const filename = fileSystemService.genFilename();
          // const url = `/${storageName}/${filename}`;
          files.push(filename);
          await fileSystemService.write({ filepath: filename, content: Buffer.from(buffer) });
        }

        const rows = await tx
          .insert(histories)
          .values({ ...parsed, images: files })
          .returning();
        result = rows[0];
      });
    } catch (dbError) {
      // If transaction fails, clean up the uploaded file
      if (files.length > 0) {
        try {
          for (const filename of files) {
            await fileSystemService.unlink({ filepath: filename });
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
