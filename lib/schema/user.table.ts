import { integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { AdapterAccountType } from "next-auth/adapters";

// drizzle table 정의
export const users = pgTable("users", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: timestamp({ withTimezone: true }),
  image: text(),
  password: text(),
  salt: text(),
  created_at: timestamp({ withTimezone: true }).defaultNow(),
  updated_at: timestamp({ withTimezone: true }),
});

export const accounts = pgTable(
  "account",
  {
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text().$type<AdapterAccountType>().notNull(),
    provider: text().notNull(),
    providerAccountId: text().notNull(),
    refresh_token: text(),
    access_token: text(),
    expires_at: integer(),
    token_type: text(),
    scope: text(),
    id_token: text(),
    session_state: text(),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ],
);
