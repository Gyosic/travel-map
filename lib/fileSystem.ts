import crypto from "crypto";
import { fileTypeFromStream } from "file-type";
import fs, { ReadStream } from "fs";
import fsPromises from "fs/promises";
import mimeTypes from "mime-types";
import path from "path";
import Stream, { PassThrough, Readable, StreamOptions } from "stream";

type ReadStreamOptions = Parameters<typeof fs.createReadStream>[1];

class FileSystem {
  // Filestorage Defualt Root
  static _storageRoot: string = "";

  static get storageRoot() {
    return this._storageRoot.replace(/\.\./g, ".");
  }

  storageName: string;
  /**
   * Create FileSystem
   */
  constructor({ storageName = "" }: { storageName?: string } = {}) {
    this.storageName = storageName.replace(/\.\./g, ".");

    this.init();
  }

  async init() {
    FileSystem._storageRoot = process.env.FILE_STORAGE_ROOT || "/tmp/map";

    this.createIfNotExists({ pathname: this.storageAbsolutePathname() });
  }

  storageAbsolutePathname() {
    return path.join(FileSystem.storageRoot, this.storageName);
  }

  async diff({ source: sourceFilePath, target }: { source: string; target: string }) {
    const targetFilefath = path.join(this.storageAbsolutePathname(), target.replace(/\.\./g, "."));
    const sourceStat = await fsPromises.stat(sourceFilePath);
    const targetStat = await fsPromises.stat(targetFilefath);

    return sourceStat.mtime.getTime() - targetStat.mtime.getTime();
  }

  async createIfNotExists({ pathname }: { pathname: string }) {
    try {
      await fsPromises.stat(pathname);
    } catch (err) {
      const { code } = err as { code?: string };
      if (code === "ENOENT") return await fsPromises.mkdir(pathname, { recursive: true });
      throw new Error(err as string);
    }
  }

  /**
   * 파일 쓰기
   *
   * 예제:
   * ```javascript
   * this.write({ filepath: 'helloworld', content: 'hello world :)' })
   * ```
   *
   * 모든 파일은 `this.storageAbsolutePathname`를 docroot로하여 상대 경로로 작동되며 상위경로로 이동 불가 ( `../` 사용 불가 )
   *
   * @param {Object}      options
   * @param {String}      options.filepath           대상 파일 경로
   * @param {String}      options.content            내용
   * @param {String}      [options.encoding=utf8]    인코딩
   */
  // async write({ filepath: _filepath, content, encoding = 'utf8' }) {
  //   const filepath = path.join(this.storageAbsolutePathname, _filepath.replace(/\.\./g, '.'))
  //   const dirname = path.dirname(filepath)

  //   if (!this.isExists({ filepath: dirname, isAbsolute: true, isDirectory: true })) {
  //     throw new Error({
  //       status: 404,
  //       message: `파일 또는 경로가 존재하지 않습니다. ${dirname.replace(this.storageAbsolutePathname, '')}`,
  //     })
  //   }

  //   fsPromises.writeFileSync(filepath, content, encoding)
  // }
  async write({
    filepath: _filepath,
    content,
    encoding = "utf8",
    touchIfNotExists = false,
  }: {
    filepath: string;
    content:
      | string
      | NodeJS.ArrayBufferView
      | Iterable<string | NodeJS.ArrayBufferView>
      | AsyncIterable<string | NodeJS.ArrayBufferView>
      | Stream;
    encoding?: BufferEncoding;
    touchIfNotExists?: boolean;
  }) {
    const filepath = this.getPath({ filepath: _filepath });
    const isExists = await this.isExists({ filepath, isAbsolute: true, isDirectory: true });
    if (!isExists) {
      if (!touchIfNotExists) {
        throw new Error(
          `파일을 찾을 수 없습니다. ${filepath.replace(this.storageAbsolutePathname(), "")}`,
        );
      }

      try {
        await fsPromises.stat(filepath);
      } catch (err) {
        const { code } = err as { code?: string };
        if (code === "ENOENT") await fsPromises.writeFile(filepath, "");
      }
    }

    await fsPromises.writeFile(filepath, content, encoding);
  }

  /**
   * 파일 읽기
   *
   * 예제:
   * ```javascript
   * await this.read({ filepath: '/tmp/helloworld' })
   * ```
   *
   * 모든 파일은 `this.storageAbsolutePathname`를 docroot로하여 상대 경로로 작동되며 상위경로로 이동 불가 ( `../` 사용 불가 )
   *
   * @param {Object}      options
   * @param {!String}      options.filepath    대상 파일 경로
   * @param {String}      [options.encoding=utf8]    인코딩
   */
  async read({ filepath: _filepath, encoding }: { filepath: string; encoding: BufferEncoding }) {
    const filepath = this.getPath({ filepath: _filepath });

    const isExists = await this.isExists({ filepath, isAbsolute: true });
    if (!isExists) {
      throw new Error(
        `파일이 존재하지 않습니다. ${filepath.replace(this.storageAbsolutePathname(), "")}`,
      );
    }

    const contentType = await this.getContentType({ filename: filepath });
    if (contentType === "application/json") {
      try {
        const file = await fsPromises.readFile(filepath, { encoding: "utf8" });
        return JSON.parse(file);
      } catch {
        return await fsPromises.readFile(filepath, encoding || "utf8");
      }
    }

    return await fsPromises.readFile(filepath, encoding);
  }

  /**
   * 파일 스트림
   *
   * 예제:
   * ```javascript
   * this.stream({ filepath: '/tmp/helloworld' })
   * ```
   *
   * 모든 파일은 `this.storageAbsolutePathname`를 docroot로하여 상대 경로로 작동되며 상위경로로 이동 불가 ( `../` 사용 불가 )
   *
   * @param {Object}      options
   * @param {!String}     options.filepath    대상 파일 경로
   */

  stream({ filepath: _filepath, options }: { filepath: string; options?: ReadStreamOptions }) {
    const filepath = path.join(this.storageAbsolutePathname(), _filepath.replace(/\.\./g, "."));

    if (!this.isExists({ filepath, isAbsolute: true }))
      throw new Error(
        `파일이 존재하지 않습니다. ${filepath.replace(this.storageAbsolutePathname(), "")}`,
      );

    return fs.createReadStream(filepath, options);
  }

  async unlink({
    filepath: _filepath,
    touchIfNotExists = false,
  }: {
    filepath: string;
    touchIfNotExists?: boolean;
  }) {
    const filepath = this.getPath({ filepath: _filepath });

    try {
      await fsPromises.unlink(filepath);
    } catch (err) {
      console.info("[FileSystem Unlink]: ", err);
    }
  }

  async getContentType({
    filepath,
    filename,
    stream: _stream,
  }: {
    filepath?: string;
    filename?: string;
    stream?: ReadStream;
  }) {
    let mime;

    let stream = _stream;

    if (filename) mime = mimeTypes.lookup(filename);

    if (!mime && !stream && filepath) stream = this.stream({ filepath });

    if (!mime && stream) {
      try {
        const content = await this.peekStreamContent(stream);
        // svg type check
        if (content.includes("<svg") && content.includes('xmlns="http://www.w3.org/2000/svg"')) {
          mime = "image/svg+xml";
        } else {
          // Support both Node.js and Web streams depending on file-type version/types
          type AnyWebReadable = ReadableStream<Uint8Array>;
          type ReadableWithToWeb = typeof Readable & {
            toWeb?: (stream: Stream.Readable) => AnyWebReadable;
          };
          const R = Readable as ReadableWithToWeb;
          type FileTypeParam = Parameters<typeof fileTypeFromStream>[0];
          const targetStream: FileTypeParam =
            typeof R.toWeb === "function"
              ? (R.toWeb(stream as Stream.Readable) as FileTypeParam)
              : (stream as unknown as FileTypeParam);
          const ft = await fileTypeFromStream(targetStream);
          mime = ft?.mime;
        }
      } catch (err) {
        console.error("Error reading stream:", err);
      }
    }

    return mime || "application/octet-stream";
  }

  private async peekStreamContent(stream: NodeJS.ReadableStream, length = 512): Promise<string> {
    return new Promise((resolve, reject) => {
      const onData = (chunk: Buffer) => {
        try {
          // Pause and push the chunk back so downstream consumers (and fileTypeFromStream)
          // can still read the full stream including this first chunk.
          stream.pause();
          const preview = chunk.slice(0, length).toString();
          const s = stream as NodeJS.ReadableStream & {
            unshift?: (chunk: Buffer | string) => void;
          };
          if (typeof s.unshift === "function") {
            s.unshift(chunk);
          }
          resolve(preview);
        } catch (err) {
          reject(err);
        } finally {
          stream.removeListener("data", onData);
        }
      };
      stream.once("data", onData);
      stream.once("error", (err) => {
        stream.removeListener("data", onData);
        reject(err);
      });
      stream.once("end", () => {
        resolve("");
      });
    });
  }

  /**
   * 파일 상태 확인
   *
   * 예제:
   * ```javascript
   * this.stat({ filepath: '/tmp/helloworld' })
   * ```
   *
   * 모든 파일은 `this.storageAbsolutePathname`를 docroot로하여 상대 경로로 작동되며 상위경로로 이동 불가 ( `../` 사용 불가 )
   *
   * @param {Object}      options
   * @param {!String}     options.filepath              대상 파일 경로
   * @param {Boolean}     [options.isAbsolute=false]    절대 경로
   */
  async stat({
    filepath: _filepath,
    isAbsolute = false,
  }: {
    filepath: string;
    isAbsolute?: boolean;
  }) {
    let filepath = _filepath;
    if (!isAbsolute)
      filepath = path.join(this.storageAbsolutePathname(), _filepath.replace(/\.\./g, "."));

    try {
      return await fsPromises.stat(filepath);
    } catch {
      throw new Error(
        `파일 또는 경로가 존재하지 않습니다. ${filepath.replace(this.storageAbsolutePathname(), "")}`,
      );
    }
  }

  /**
   * 파일 존재 유무 확인
   *
   * 예제:
   * ```javascript
   * this.isExists({ filepath: '/tmp/helloworld' })
   * ```
   *
   * 모든 파일은 `this.storageAbsolutePathname`를 docroot로하여 상대 경로로 작동되며 상위경로로 이동 불가 ( `../` 사용 불가 )
   *
   * @param {Object}      options
   * @param {!String}     options.filepath              대상 파일 경로
   * @param {Boolean}     [options.isAbsolute=false]    절대 경로
   */
  async isExists({
    filepath: _filepath,
    isAbsolute = false,
    isDirectory = false,
  }: {
    filepath: string;
    isAbsolute?: boolean;
    isDirectory?: boolean;
  }) {
    let filepath = _filepath;
    if (!isAbsolute)
      filepath = path.join(this.storageAbsolutePathname(), _filepath.replace(/\.\./g, "."));

    try {
      if (!isDirectory) {
        const stat = await this.stat({ filepath, isAbsolute: true });
        return stat.isFile();
      }
      const stat = await this.stat({ filepath: path.dirname(filepath), isAbsolute: true });
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * 파일 범위 조회
   *
   * 예제:
   * ```javascript
   * this.range({ range: 0, size: 1024 })
   * ```
   *
   * @param {Object}      options
   * @param {!String}     options.range   범위
   * @param {!Number}     options.size    크기
   */
  getContentRange({ range, size }: { range: string; size: number }) {
    if (!range) throw new Error("Range Not Satisfiable", { cause: { status: 416 } });

    const [, startStr, endStr] = range.split(/bytes=([0-9]+)?-([0-9]+)?/);
    let start = parseInt(startStr);
    let end = parseInt(endStr);

    // 시작 & 종료가 지정되지 않은 경우
    if (isNaN(start) && isNaN(end))
      throw new Error("Range Not Satisfiable", { cause: { status: 416 } });

    if (isNaN(start)) {
      start = size - 1 - end;
      end = size - 1;
    }
    if (isNaN(end)) end = size - 1;

    // 시작 바이트가 0보다 작을 경우
    if (start < 0) throw new Error("Range Not Satisfiable", { cause: { status: 416 } });
    // 시작 바이트가 길이를 넘어갈 경우
    if (start > size - 1) throw new Error("Range Not Satisfiable", { cause: { status: 416 } });
    // 종료 바이트가 전체 길이를 벗어난 경우
    if (end > size - 1) throw new Error("Range Not Satisfiable", { cause: { status: 416 } });
    // 시작 바이트가 종료 바이트 보다  클 경우
    if (start > end) throw new Error("Range Not Satisfiable", { cause: { status: 416 } });

    const chunkSize = end - start + 1;

    return { chunkSize, start, end, range: `bytes ${start}-${end}/${size}` };
  }

  getPath({ filepath: _filepath }: { filepath: string }) {
    let filepath = _filepath;

    while (filepath.startsWith(this.storageAbsolutePathname()))
      filepath = filepath.substring(this.storageAbsolutePathname().length);

    return path.join(this.storageAbsolutePathname(), filepath.replace(/\.\./g, "."));
  }

  genFilename() {
    return crypto.randomBytes(16).toString("hex");
  }
}

export default FileSystem;
