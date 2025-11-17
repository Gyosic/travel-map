import { date, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "@/lib/schema/user.table";

// drizzle table 정의
export const histories = pgTable("histories", {
  _id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  date: date().notNull(),
  content: text().notNull(),
  address: text(),
  emd_cd: text(),
  sgg_cd: text(),
  rating: integer(),
  images: text().array(),
  user_id: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp(),
});
