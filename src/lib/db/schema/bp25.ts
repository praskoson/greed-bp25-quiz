import {
  uuid,
  varchar,
  timestamp,
  index,
  pgSchema,
  uniqueIndex,
  integer,
  pgEnum,
  text,
  boolean,
  bigint,
  json,
} from "drizzle-orm/pg-core";

export const bp25Schema = pgSchema("bp25");

export const users = bp25Schema.table(
  "users",
  {
    id: uuid().defaultRandom().primaryKey(),
    walletAddress: varchar().notNull().unique(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [uniqueIndex("wallet_address_idx").on(table.walletAddress)],
);

export const authSessions = bp25Schema.table(
  "auth_session",
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

export const stakeVerificationStateEnum = pgEnum("verficationState", [
  "failed",
  "processing",
  "success",
]);

export const questionAssignmentSourceEnum = pgEnum("questionAssignmentSource", [
  "job",
  "admin",
]);

export const userQuizSessions = bp25Schema.table(
  "user_quiz_session",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Stake info (primary stake)
    stakeAmountLamports: bigint({ mode: "number" }).notNull(),
    stakeDurationSeconds: integer().notNull(),
    stakeSignature: varchar().notNull().unique(),
    stakeVerification: stakeVerificationStateEnum()
      .default("processing")
      .notNull(),
    stakeConfirmedAt: timestamp(),

    // Cached total of all stakes (primary + secondary)
    totalStakeLamports: bigint({ mode: "number" }),

    createdAt: timestamp().defaultNow().notNull(),

    // Quiz info
    score: integer(),
    completedAt: timestamp(),
    questionsAssignedBy: questionAssignmentSourceEnum().default("job"),

    // Admin moderation
    shadowBan: boolean().default(false).notNull(),
  },
  (table) => [
    index("user_quiz_session_user_id_idx").on(table.userId),
    uniqueIndex("user_quiz_sesson_stake_signature_idx").on(
      table.stakeSignature,
    ),
  ],
);

export const secondaryUserStakes = bp25Schema.table(
  "secondary_user_stake",
  {
    id: uuid().defaultRandom().primaryKey(),
    sessionId: uuid()
      .notNull()
      .references(() => userQuizSessions.id, { onDelete: "cascade" }),
    amountLamports: bigint({ mode: "number" }).notNull(),
    durationSeconds: integer().notNull(),
    signature: varchar().notNull().unique(),
    verification: stakeVerificationStateEnum().default("processing"),
    confirmedAt: timestamp(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    index("secondary_user_stake_session_id_idx").on(table.sessionId),
    uniqueIndex("secondary_user_stake_signature_idx").on(table.signature),
  ],
);

export const quizCategories = bp25Schema.table("quiz_category", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar().notNull().unique(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const quizQuestions = bp25Schema.table("quiz_question", {
  id: uuid().defaultRandom().primaryKey(),
  categoryId: uuid()
    .notNull()
    .references(() => quizCategories.id, { onDelete: "cascade" }),
  questionText: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const quizAnswers = bp25Schema.table("quiz_answer", {
  id: uuid().defaultRandom().primaryKey(),
  questionId: uuid()
    .notNull()
    .references(() => quizQuestions.id, { onDelete: "cascade" }),
  answerText: text().notNull(),
  isCorrect: boolean().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const quizQuestionAssignments = bp25Schema.table(
  "quiz_question_assignment",
  {
    id: uuid().defaultRandom().primaryKey(),
    sessionId: uuid()
      .notNull()
      .references(() => userQuizSessions.id, { onDelete: "cascade" }),
    questionId: uuid()
      .notNull()
      .references(() => quizQuestions.id, { onDelete: "cascade" }),
    displayOrder: integer().notNull(),
    userAnswerId: uuid().references(() => quizAnswers.id, {
      onDelete: "set null",
    }),
    answeredAt: timestamp(),
  },
  (table) => [
    index("quiz_question_assignment_session_id_idx").on(table.sessionId),
    index("quiz_question_assignment_question_id_idx").on(table.questionId),
    // Ensure each question appears only once per session
    uniqueIndex("quiz_question_assignment_session_question_idx").on(
      table.sessionId,
      table.questionId,
    ),
  ],
);

export type AppSettingsData = {
  quizPaused: boolean;
};

const defaultAppSettings: AppSettingsData = {
  quizPaused: false,
};

export const appSettings = bp25Schema.table("app_settings", {
  id: uuid().defaultRandom().primaryKey(),
  data: json().$type<AppSettingsData>().notNull().default(defaultAppSettings),
  updatedAt: timestamp().defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AuthSession = typeof authSessions.$inferSelect;
export type NewAuthSession = typeof authSessions.$inferInsert;
export type AppSettings = typeof appSettings.$inferSelect;
export type UserQuizSession = typeof userQuizSessions.$inferSelect;
export type NewUserQuizSession = typeof userQuizSessions.$inferInsert;
export type SecondaryUserStake = typeof secondaryUserStakes.$inferSelect;
export type NewSecondaryUserStake = typeof secondaryUserStakes.$inferInsert;
