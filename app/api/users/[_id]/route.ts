import { eq } from "drizzle-orm";
import FileSystem from "@/lib/fileSystem";
import { db } from "@/lib/pg";
import { histories } from "@/lib/schema/history.table";
import { users } from "@/lib/schema/user.table";

const fileSystemService = new FileSystem();

interface Params {
  _id: string;
}
export async function DELETE(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const { _id } = await params;
    // 1. 삭제될 histories의 이미지 경로들을 먼저 조회
    const userHistories = await db
      .select({ images: histories.images })
      .from(histories)
      .where(eq(histories.user_id, _id));

    // 2. 모든 이미지 파일 삭제
    userHistories.forEach((history) =>
      ((history?.images || []) as File[]).forEach(async (image) => {
        await fileSystemService.unlink({ filepath: image.src });
      }),
    );

    // 3. User 삭제 (cascade로 histories도 자동 삭제됨)
    await db.delete(users).where(eq(users.id, _id));

    return Response.json("유저를 성공적으로 삭제했습니다.");
  } catch (err) {
    return Response.json(err, { status: 500 });
  }
}
