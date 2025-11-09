import {
  uuid,
  varchar,
  timestamp,
  index,
  pgSchema,
  uniqueIndex,
  decimal,
  integer,
  boolean,
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

export const gameSessions = bp25Schema.table(
  "game_sessions",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Stake info
    stakeAmount: decimal({ precision: 20, scale: 9 }).notNull(),
    stakeDuration: integer().notNull(), // days
    stakeTxSignature: varchar({ length: 88 }).notNull().unique(),
    stakeConfirmed: boolean().default(false).notNull(),
    stakeConfirmedAt: timestamp(),

    // Quiz info
    questionsAssigned: boolean().default(false).notNull(),
    answersSubmitted: boolean().default(false).notNull(),
    correctAnswers: integer().default(0).notNull(),
    score: decimal({ precision: 20, scale: 9 }).default("0").notNull(),

    createdAt: timestamp().defaultNow().notNull(),
    completedAt: timestamp(),
  },
  (table) => [
    index("game_sessions_user_id_idx").on(table.userId),
    uniqueIndex("game_sessions_tx_signature_idx").on(table.stakeTxSignature),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AuthSession = typeof authSessions.$inferSelect;
export type NewAuthSession = typeof authSessions.$inferInsert;
export type GameSession = typeof gameSessions.$inferSelect;
export type NewGameSession = typeof gameSessions.$inferInsert;
