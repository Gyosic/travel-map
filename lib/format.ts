import { isNil } from "es-toolkit";

export type DateFormatType =
  | "default"
  | "iso"
  | "ymd"
  | "hms"
  | "md h"
  | "md hm"
  | "ymd h"
  | "ymd hm"
  | "ymd hms"
  | "full"
  | "log"
  | "LLL";

/**
 * 날짜를 다양한 형식으로 반환한다.
 *
 * @description
 * 날짜 객체를 지정된 형식으로 변환한다.
 *
 * @example
 * formatter(new Date(), { type: "ymd hm" })
 *
 * @param date `Date` | `number`
 * @param options.type `default` | `iso` | `ymd` | `hms` | `md h` | `md hm` | `ymd h` | `ymd hm` | `ymd hms` | `full` | `log` | `LLL`
 * @returns string
 */
export function date(timestamp: Date | number, options?: { type?: DateFormatType }) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

  const { type = "default" } = options ?? { type: "default" };

  if ("iso" === type) return date.toISOString();

  if ("ymd" === type) return date.toISOString().substring(0, 10);

  const intlOptions: Intl.DateTimeFormatOptions = { hourCycle: "h23" };

  // toLocaleString() 함수는 시스템에 맞추어 자동으로
  // 타임존 오프셋을 조정하므로 undefined를 전달함
  if ("LLL" === type) return date.toLocaleString(undefined, intlOptions);

  const localeStr = date.toLocaleString(undefined, {
    ...intlOptions,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  if ("hms" === type) return localeStr.replace(/\d+\. \d+\. \d+\./, "").trim();

  const full = localeStr.replace(/(\d+)\. (\d+)\. (\d+)\./, "$1-$2-$3");

  if ("md h" === type) return full.replace(/^\d+-|(:\d+){2}$/g, "");
  if ("ymd h" === type) return full.replace(/(:\d+){2}$/g, "");
  if ("md hm" === type) return full.replace(/^\d+-|:\d+$/g, "");
  if ("ymd hm" === type) return full.replace(/:\d+$/g, "");

  // if (["full", "ymd hms", "log"].includes(type))
  return full;
}

/**
 * 날짜를 다양한 형식으로 반환한다.
 *
 * @description
 * 날짜 객체를 지정된 형식으로 변환한다.
 *
 * @example
 * formatter(new Date(), { type: "ymd hm" })
 *
 * @param date `Date` | `number`
 * @param options.type `default` | `iso` | `ymd` | `hms` | `md h` | `md hm` | `ymd h` | `ymd hm` | `ymd hms` | `full` | `log` | `LLL`
 * @returns string
 */

export function fromNow(timestamp: Date) {
  const curr = (Date.now() - timestamp.getTime()) / 1000;

  if (curr < 60) return "방금 전";
  if (curr < 3600) return `${Math.floor(curr / 60)}분 전`;
  if (curr < 86400) return `${Math.floor(curr / 3600)}시간 전`;
  if (curr < 604800) return `${Math.floor(curr / 86400)}일 전`;
  if (curr < 2592000) return `${Math.floor(curr / 604800)}주 전`;
  if (curr < 31536000) return `${Math.floor(curr / 2592000)}달 전`;
  if (curr >= 31536000) return `${Math.floor(curr / 31536000)}년 전`;
}

/**
 * @description
 * 숫자를 세 자리 수 마다 ",(콤마)" 형식으로 반환한다.
 *
 * @example
 * thousandComma(100000)
 *
 * @param value number
 * @returns string
 */

export function thousandComma(value: number) {
  if (isNil(value)) return "";

  const [integer = "", float = ""] = String(value).split(".");
  const formatted = integer.replace(/[0-9](?=(?:[0-9]{3})+(?![0-9]))/g, "$&,");

  if (float) return formatted.concat(".", float);
  return formatted;
}

export function fileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const size = parseFloat((bytes / k ** i).toFixed(dm));
  return `${size} ${sizes[i]}`;
}
