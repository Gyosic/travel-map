import { isNil } from "es-toolkit/compat";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { auth } from "@/lib/auth";
import FileSystem from "@/lib/fileSystem";
import { db } from "@/lib/pg";
import { fileSchema } from "@/lib/schema/file";
import { users } from "@/lib/schema/user.table";

const storageName = "profile";
const fileSystemService = new FileSystem({ storageName });

const schema = z.object({
  name: z
    .string({
      error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
    })
    .min(1, "필수 입력값 입니다."),
  image: z.instanceof(File).or(fileSchema).optional(),
});

export async function PUT(req: NextRequest) {
  const session = await auth();

  if (!session) return NextResponse.json("인증되지 않은 요청입니다.", { status: 401 });

  try {
    const formData = await req.formData();
    const body = Object.fromEntries(formData.entries());
    const { image, ...profile } = await schema.parseAsync(body);

    let src: string | undefined;
    try {
      await db.transaction(async (tx) => {
        if (image) {
          const buffer = await (image as File).arrayBuffer();

          const filename = fileSystemService.genFilename();
          src = `/${storageName}/${filename}`;

          Object.assign(profile, { image: src });

          await fileSystemService.write({ filepath: filename, content: Buffer.from(buffer) });
        }

        await tx.update(users).set(profile);
      });
    } catch (dbError) {
      // If transaction fails, clean up the uploaded file
      if (src) {
        try {
          await fileSystemService.unlink({ filepath: src.replace(`/${storageName}`, "") });
        } catch (unlinkError) {
          console.error("Failed to cleanup file:", unlinkError);
        }
      }
      throw dbError;
    }

    return NextResponse.json("프로필이 변경되었습니다.", { status: 201 });
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
