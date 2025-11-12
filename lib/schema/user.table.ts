import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// drizzle table 정의
export const users = pgTable("users", {
  _id: uuid().primaryKey().defaultRandom(),
  username: text().notNull().unique(),
  password: text().notNull(),
  salt: text(),
  name: text().notNull(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp(),
});
