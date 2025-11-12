/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> **/
// import {
//   and,
//   between,
//   Column,
//   ColumnDataType,
//   eq,
//   gt,
//   gte,
//   ilike,
//   isNotNull,
//   isNull,
//   like,
//   lt,
//   lte,
//   ne,
//   Operators,
//   or,
//   SQL,
//   SQLWrapper,
//   sql,
// } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
// import { PgColumn, PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";
// import { map, reduce } from "es-toolkit/compat";
import { Pool } from "pg";
import { postgresql, geo } from "@/config";

export const geoPool = new Pool({
  ...geo,
  max: 10, // 최대 연결 수 (쓰기 작업용)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// INSERT/UPDATE/DELETE용 Pool (쓰기 전용)
export const writePool = new Pool({
  ...postgresql,
  max: 10, // 최대 연결 수 (쓰기 작업용)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// SELECT용 Pool (읽기 전용)
export const readPool = new Pool({
  ...postgresql,
  max: 20, // 최대 연결 수 (읽기 작업용, 더 많게 설정 가능)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// 기본 db는 쓰기용으로 유지 (하위 호환성)
export const writeDb = drizzle({ client: writePool });

// 읽기 전용 db 인스턴스
export const db = drizzle({ client: readPool });

writePool.on("error", (err) => {
  console.error("Unexpected error on idle client (write pool)", err);
  process.exit(-1);
});

readPool.on("error", (err) => {
  console.error("Unexpected error on idle client (read pool)", err);
  process.exit(-1);
});

// export const operators = (
//   col: Column,
//   operator: keyof Operators,
//   value: ColumnDataType,
//   isNumeric: boolean = false,
// ) => {
//   switch (operator) {
//     case "eq":
//       return eq(col, value);
//     case "ne":
//       return ne(col, value);
//     case "gt":
//       // 빈 문자열이면 NULL 체크 추가
//       return isNumeric ? sql`${col} != '' AND CAST(${col} AS NUMERIC) > ${value}` : gt(col, value);
//     case "gte":
//       return isNumeric
//         ? sql`${col} != '' AND CAST(${col} AS NUMERIC) >= ${value}`
//         : gte(col, value);
//     case "lt":
//       return isNumeric ? sql`${col} != '' AND CAST(${col} AS NUMERIC) < ${value}` : lt(col, value);
//     case "lte":
//       return isNumeric
//         ? sql`${col} != '' AND CAST(${col} AS NUMERIC) <= ${value}`
//         : lte(col, value);
//     case "between":
//       if (!Array.isArray(value) || value.length !== 2) {
//         throw new Error(
//           `Invalid value for 'between' operator: ${value}는 두 개의 값을 포함해야 합니다.`,
//         );
//       }
//       return isNumeric
//         ? sql`${col} != '' AND CAST(${col} AS NUMERIC) BETWEEN ${value[0]} AND ${value[1]}`
//         : between(col, value[0], value[1]);
//     case "notBetween":
//       if (!Array.isArray(value) || value.length !== 2) {
//         throw new Error(
//           `Invalid value for 'notBetween' operator: ${value}는 두 개의 값을 포함해야 합니다.`,
//         );
//       }
//       return isNumeric
//         ? sql`${col} != '' AND CAST(${col} AS NUMERIC) NOT BETWEEN ${value[0]} AND ${value[1]}`
//         : or(lt(col, value[0]), gt(col, value[1]));
//     case "like":
//       return like(col, `%${value}%`);
//     case "ilike":
//       return ilike(col, `%${value}%`);
//     case "isNull":
//       return isNull(col);
//     case "isNotNull":
//       return isNotNull(col);
//     case "sql":
//       const [head, tail] = value.split("column");
//       const sqlChunks = [sql.raw(head), sql`${col}`, sql.raw(tail)];
//       return sql.join(sqlChunks);
//     default:
//       throw new Error(`Invalid operator: ${operator}는 지원되지 않는 연산자입니다.`);
//   }
// };

// type FilterType<T> = {
//   field: keyof T;
//   operator: keyof Operators;
//   value: ColumnDataType;
//   or?: boolean;
// };

// interface QueryParams<T> {
//   where?: FilterType<T>[];
//   sort?: { id: keyof T; desc: boolean }[];
//   pagination?: { pageIndex: number; pageSize: number };
// }

// const tableMap: Record<string, PgTableWithColumns<any>> = {
//   datas,
//   contracts,
//   devices,
//   sites,
//   users,
// };

// // 각 테이블의 식별자 매핑
// const tableIdentifierMap = new Map<PgTableWithColumns<any>, string>([
//   [datas, "datas"],
//   [contracts, "contracts"],
//   [devices, "devices"],
//   [sites, "sites"],
//   [users, "users"],
// ]);

// // 숫자로 변환해야 하는 문자열 필드 정의
// const numericStringFields: Record<string, string[]> = {
//   datas: ["hum", "temp", "batt", "rsrp", "rsrq", "sinr", "meter", "meterdata"],
// };

// export const selectQuerying = <T extends Record<string, PgColumn<any>>, P extends TableConfig>(
//   table: PgTableWithColumns<P>,
//   params: QueryParams<T>,
// ) => {
//   let whereCondition: SQL<unknown> | undefined;
//   let orderCondition: SQL<unknown>[] = [];
//   let pagingCondition: { limit: number; offset: number } | undefined;

//   if (params.where && params.where.length > 0) {
//     const { or: orConditions, conditions } = reduce(
//       params.where,
//       (acc, { or = false, ...filter }) => {
//         let col = table[filter.field as string];
//         let value: any = filter.value;

//         if (!col) {
//           const [tableName, fieldKey] = (filter.field as string).split(".");
//           const joinTable = tableMap[tableName];
//           col = joinTable?.[fieldKey];

//           if (!col) throw Error("테이블을 찾을 수 없습니다.");
//         }

//         if (col && col.dataType === "date") {
//           if (Array.isArray(value)) value = map(value, (d) => new Date(d));
//           else value = new Date(filter.value);
//         }

//         // 숫자 필드인 경우 숫자 비교 연산자에 CAST 적용
//         const tableName = tableIdentifierMap.get(table) || "";
//         const numericFields = numericStringFields[tableName] || [];
//         const fieldName = String(filter.field).replace(new RegExp(`^${tableName}\\.`), "");
//         const isNumericField = numericFields.includes(fieldName);
//         const isNumericOperator = ["gt", "gte", "lt", "lte", "between", "notBetween"].includes(
//           filter.operator,
//         );
//         const isNumeric = isNumericField && isNumericOperator;

//         if (or) acc.or.push(operators(col, filter.operator, value, isNumeric));
//         else acc.conditions.push(operators(col, filter.operator, value, isNumeric));

//         return acc;
//       },
//       { or: [] as (SQLWrapper | undefined)[], conditions: [] as (SQLWrapper | undefined)[] },
//     );

//     whereCondition = and(...conditions, or(...orConditions));
//   }

//   if (params?.sort && params.sort.length > 0) {
//     const conditions = map(params.sort, ({ id, desc }) => {
//       const col = table[id as string];

//       if (!col) {
//         if (id.toString().includes(".")) {
//           const [jsonField, jsonPath] = id.toString().split(".");
//           const jsonCol = table[jsonField as string];

//           if (!jsonCol) {
//             if (desc)
//               return sql.raw(String(id) + " DESC NULLS LAST"); // drizzleOrmDesc(sql.raw(String(id)));
//             else return sql.raw(String(id) + " ASC NULLS LAST"); // drizzleOrmAsc(sql.raw(String(id)));
//           }

//           // const jsonSortExpr = sql`${jsonCol}->>${sql.raw(`'${jsonPath}'`)}`;

//           if (desc)
//             return sql`${jsonCol}->>${sql.raw(`'${jsonPath}'`)} DESC NULLS LAST`; // drizzleOrmDesc(jsonSortExpr);
//           else return sql`${jsonCol}->>${sql.raw(`'${jsonPath}'`)} ASC NULLS LAST`; // drizzleOrmAsc(jsonSortExpr);
//         }
//       }

//       // 숫자로 변환이 필요한 필드인지 확인
//       const tableName = tableIdentifierMap.get(table) || "";
//       const numericFields = numericStringFields[tableName] || [];
//       const fieldName = id.toString().replace(new RegExp(`^${tableName}\\.`), "");

//       // 숫자로 변환해야 하는 필드면 CAST 사용 (빈 문자열을 NULL로 처리)
//       if (numericFields.includes(fieldName)) {
//         if (desc) return sql`CAST(NULLIF(${col}, '') AS NUMERIC) DESC NULLS LAST`;
//         else return sql`CAST(NULLIF(${col}, '') AS NUMERIC) ASC NULLS LAST`;
//       }

//       if (desc)
//         return sql`${col} DESC NULLS LAST`; // drizzleOrmDesc(col);
//       else return sql`${col} ASC NULLS LAST`; // drizzleOrmAsc(col);
//     });

//     orderCondition = conditions;
//   }

//   if (params?.pagination) {
//     const { pageSize, pageIndex } = params.pagination;

//     pagingCondition = { limit: pageSize, offset: pageIndex * pageSize };
//   }
//   return { whereCondition, orderCondition, pagingCondition };
// };
