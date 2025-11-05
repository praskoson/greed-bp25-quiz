import {
  uuid,
  varchar,
  timestamp,
  index,
  pgSchema,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const bp25Schema = pgSchema("bp25");

export const users = bp25Schema.table(
  "users",
  {
    id: uuid().defaultRandom().primaryKey(),
    walletAddress: varchar({ length: 44 }).notNull().unique(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [uniqueIndex("wallet_address_idx").on(table.walletAddress)],
);

export const authSessions = bp25Schema.table(
  "auth_sessions",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    walletAddress: varchar({ length: 44 }).notNull(),
    token: varchar({ length: 500 }).notNull().unique(),
    expiresAt: timestamp().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    lastAccessedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    index("userIdIdx").on(table.userId),
    index("tokenIdx").on(table.token),
    uniqueIndex("walletAddressIdx").on(table.walletAddress),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AuthSession = typeof authSessions.$inferSelect;
export type NewAuthSession = typeof authSessions.$inferInsert;
