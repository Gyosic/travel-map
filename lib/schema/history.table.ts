import { date, integer, pgTable, point, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "@/lib/schema/user.table";

// drizzle table 정의
export const histories = pgTable("histories", {
  _id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  date: date().notNull(),
  content: text().notNull(),
  address: text(),
  lnglat: point(),
  sido_cd: text(),
  emd_cd: text(),
  sgg_cd: text(),
  rating: integer(),
  images: text().array(),
  tags: varchar().array(),
  user_id: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp(),
});
