import { isNil } from "es-toolkit/compat";
import { z } from "zod";
import { fileSchema } from "@/lib/schema/file";
import type { Model } from "@/lib/schema/model";

// File 타입을 위한 커스텀 스키마
const fileInstanceSchema = z.union([
  // File 인스턴스
  z.instanceof(File),
  // 기존 파일 객체
  fileSchema
    .partial()
    .extend({
      name: z.string(),
      size: z.number(),
      type: z.string(),
      lastModified: z.number(),
      path: z.string().optional(), // 서버에 저장된 경로
    }),
]);

// Enum 타입 헬퍼
type EnumLike = Record<string, string | number>;

type ElementType<F extends Model> = F["type"] extends "enum"
  ? z.ZodString
  : F["type"] extends "number"
    ? z.ZodNumber
    : F["type"] extends "file"
      ? typeof fileInstanceSchema
      : F["type"] extends "record"
        ? z.ZodRecord
        : z.ZodString;

type TypeMap<F extends Model> = F["multiple"] extends true
  ? z.ZodArray<ElementType<F>>
  : ElementType<F>;

type ShapeFromModel<T extends Record<string, Model>> = {
  [K in keyof T]: TypeMap<T[K]>;
};

// Model의 errors 필드 타입 정의
interface ModelErrors {
  required?: string;
  invalid?: string;
  min?: string;
  max?: string;
  pattern?: string;
  regexp?: string;
  enum?: string;
  email?: string;
  accept?: string;
  size?: string;
  refine?: string;
  unique?: string;
}

type ModelOptions = Omit<Model, "name"> & { errors?: ModelErrors };

const withConstraints = (base: z.ZodTypeAny, opts: ModelOptions): z.ZodTypeAny => {
  let schema: z.ZodTypeAny = base;
  const errs = opts?.errors as ModelErrors | undefined;

  // 문자열 계열
  if (schema instanceof z.ZodString) {
    let s = schema as z.ZodString;
    if (!isNil(opts?.min)) {
      s = s.min(opts.min as number, {
        message: errs?.min || `최소 ${opts.min}자 이상 입력해주세요.`,
      });
    }
    if (!isNil(opts?.max)) {
      s = s.max(opts.max as number, {
        message: errs?.max || `최대 ${opts.max}자 이하 입력해주세요.`,
      });
    }
    if (!isNil(opts?.regexp) && opts.regexp !== "") {
      if (opts.regexp instanceof RegExp) s = s.regex(opts.regexp, { message: errs?.regexp });
      else if (typeof opts.regexp === "string")
        s = s.regex(new RegExp(opts.regexp), { message: errs?.regexp });
    }
    if (!isNil(opts?.pattern) && opts.regexp !== "") {
      if (opts.pattern instanceof RegExp) s = s.regex(opts.pattern, { message: errs?.pattern });
      else if (typeof opts.pattern === "string")
        s = s.regex(new RegExp(opts.pattern), { message: errs?.pattern });
    }

    schema = s;
  }

  // 숫자 계열
  if (schema instanceof z.ZodNumber) {
    let n = schema as z.ZodNumber;
    if (opts?.min != null) {
      n = n.min(opts.min as number, { message: errs?.min });
    }
    if (opts?.max != null) {
      n = n.max(opts.max as number, { message: errs?.max });
    }
    schema = n;
  }

  // 날짜 계열 (z.date 사용 시에만 적용)
  if (schema instanceof z.ZodDate) {
    // Date 범위 검증이 필요하면 여기에 추가
    if (opts?.min != null && opts.min instanceof Date) {
      schema = (schema as z.ZodDate).min(opts.min, { message: errs?.min });
    }
    if (opts?.max != null && opts.max instanceof Date) {
      schema = (schema as z.ZodDate).max(opts.max, { message: errs?.max });
    }
  }

  // required가 명시적으로 true가 아니면 optional 처리
  if (opts?.required !== true) {
    schema = schema.nullable().optional();
  }

  if (opts?.unique === true && opts?.duplicateCheck instanceof Function) {
    schema = schema.refine(opts.duplicateCheck as (arg: unknown) => unknown, {
      message: errs?.unique ?? "중복체크를 진행해주세요.",
    });
  }

  if (opts?.refine && opts.refine instanceof Function) {
    schema = schema.refine(opts.refine as (arg: unknown) => unknown, {
      message: errs?.refine ?? "유효하지 않은 값 입니다.",
    });
  }

  return schema;
};

export const buildSchema = <T extends Record<string, Model>>(model: T) => {
  const shape = Object.entries(model).reduce<Record<string, z.ZodTypeAny>>(
    (acc, [fieldKey, fieldModel]) => {
      let base: z.ZodTypeAny;
      const errors = fieldModel.errors as ModelErrors | undefined;

      switch (fieldModel.type) {
        case "enum": {
          // enum 타입 처리
          const enumValues = fieldModel.enums as EnumLike | undefined;
          if (enumValues) {
            const values = Object.values(enumValues).filter(
              (v): v is string => typeof v === "string",
            );
            if (values.length > 0) {
              // z.enum은 [string, ...string[]] 타입이 필요함
              base = z.enum([values[0], ...values.slice(1)] as [string, ...string[]], {
                message: errors?.enum ?? errors?.invalid ?? "필수 입력값 입니다.",
              });
            } else {
              base = z.string({ message: errors?.invalid ?? "유효하지 않은 값 입니다." });
            }
          } else {
            base = z.string({ message: errors?.invalid ?? "유효하지 않은 값 입니다." });
          }
          break;
        }

        case "rating":
        case "number": {
          base = z.coerce.number({ message: errors?.invalid ?? "유효하지 않은 값입니다." });

          break;
        }

        case "switch":
        case "boolean": {
          base = z.coerce.boolean({ message: errors?.invalid ?? "유효하지 않은 값입니다." });

          break;
        }

        case "file":
          base = fileInstanceSchema
            .refine(
              (file) => {
                // 파일 확장자 검증
                if (fieldModel.accept && fieldModel.accept.length > 0) {
                  const fileName = file?.name;
                  const fileExtension = fileName?.split(".").pop()?.toLowerCase();
                  return fieldModel.accept.includes(fileExtension || "");
                }
                return true;
              },
              {
                message: errors?.accept ?? "허용되지 않는 파일 형식입니다.",
              },
            )
            .refine(
              (file) => {
                // 파일 크기 검증 (바이트 단위)
                // Model에 size 필드가 없으므로 max를 사용
                const maxSize = fieldModel.max as number | undefined;
                if (maxSize && file && file.size > maxSize) return false;
                return true;
              },
              {
                message: errors?.size ?? "파일 크기가 허용 범위를 벗어났습니다.",
              },
            );
          break;

        case "date": {
          base = z.string({ message: errors?.invalid ?? "유효하지 않은 값입니다." });

          break;
        }

        case "record": {
          // Record<string, any> 타입으로 변경하여 타입 추론 개선
          base = z.record(z.string(), z.any(), {
            message: errors?.invalid ?? "유효하지 않은 값입니다.",
          });
          break;
        }

        case "email": {
          base = z.email({ message: errors?.invalid ?? "유효하지 않은 이메일 주소입니다." });
          break;
        }

        default: {
          const stringSchema = z.string({ message: errors?.invalid ?? "유효하지 않은 값입니다." });

          // required가 true면 추가 검증
          if (fieldModel.required === true) {
            base = stringSchema.min(1, { message: errors?.required ?? "필수 입력값 입니다." });
          } else {
            base = stringSchema;
          }
        }
      }

      // multiple이 true면 배열로 감싸기
      if (fieldModel.multiple === true) {
        base = z.array(base, { message: errors?.invalid ?? "배열이어야 합니다." });
      }

      // required가 true가 아니면 optional 처리는 withConstraints에서
      acc[fieldKey] = withConstraints(base, fieldModel);
      return acc;
    },
    {},
  );

  return z.object(shape) as z.ZodObject<ShapeFromModel<T>>;
};
