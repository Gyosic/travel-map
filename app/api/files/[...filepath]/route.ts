import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import FileSystem from "@/lib/fileSystem";

const fileSystemService = new FileSystem({ storageName: "files" });

type Params = { filepath: string[] };

export async function GET(req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const { filepath: _filepath } = await params;
    const filepath = _filepath.join("/");
    const { size } = await fileSystemService.stat({ filepath });
    const range = req.headers.get("range");
    const contentType = await fileSystemService.getContentType({ filepath });

    const headers = new Headers();

    if (range) {
      const {
        chunkSize,
        start,
        end,
        range: rangeHeader,
      } = fileSystemService.getContentRange({ range, size });

      const stream = fileSystemService.stream({ filepath, options: { start, end } });
      const webStream = Readable.toWeb(stream) as ReadableStream<Uint8Array>;

      headers.set("Content-Range", rangeHeader);
      headers.set("Content-Length", chunkSize.toString());
      headers.set("Accept-Ranges", "bytes");
      headers.set("Content-Type", contentType);

      return new NextResponse(webStream, {
        status: 206, // Partial Content
        headers,
      });
    } else {
      const stream = fileSystemService.stream({ filepath });
      const webStream = Readable.toWeb(stream) as ReadableStream<Uint8Array>;

      headers.set("Content-Length", size.toString());
      headers.set("Content-Type", contentType);

      return new NextResponse(webStream, {
        status: 200,
        headers,
      });
    }
  } catch (error) {
    const { message } = error as Error;
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
