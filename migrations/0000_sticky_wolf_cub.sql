CREATE SCHEMA "bp25";
--> statement-breakpoint
CREATE TYPE "public"."questionAssignmentSource" AS ENUM('job', 'admin');--> statement-breakpoint
CREATE TYPE "public"."verficationState" AS ENUM('failed', 'processing', 'success');--> statement-breakpoint
CREATE TABLE "admin_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "admin_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "admin_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "admin_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bp25"."app_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data" json DEFAULT '{"quizPaused":false}'::json NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bp25"."auth_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_address" varchar(44) NOT NULL,
	"token" varchar(500) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_accessed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "bp25"."quiz_answer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"answer_text" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bp25"."quiz_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "bp25"."quiz_question_assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"display_order" integer NOT NULL,
	"user_answer_id" uuid,
	"answered_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "bp25"."quiz_question" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bp25"."secondary_user_stake" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"amount_lamports" bigint NOT NULL,
	"duration_seconds" integer NOT NULL,
	"signature" varchar NOT NULL,
	"verification" "verficationState" DEFAULT 'processing',
	"confirmed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "secondary_user_stake_signature_unique" UNIQUE("signature")
);
--> statement-breakpoint
CREATE TABLE "bp25"."user_quiz_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"stake_amount_lamports" bigint NOT NULL,
	"stake_duration_seconds" integer NOT NULL,
	"stake_signature" varchar NOT NULL,
	"stake_verification" "verficationState" DEFAULT 'processing' NOT NULL,
	"stake_confirmed_at" timestamp,
	"total_stake_lamports" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"score" integer,
	"completed_at" timestamp,
	"questions_assigned_by" "questionAssignmentSource" DEFAULT 'job',
	"shadow_ban" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_quiz_session_stakeSignature_unique" UNIQUE("stake_signature")
);
--> statement-breakpoint
CREATE TABLE "bp25"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_walletAddress_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
ALTER TABLE "admin_account" ADD CONSTRAINT "admin_account_user_id_admin_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_session" ADD CONSTRAINT "admin_session_user_id_admin_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bp25"."auth_session" ADD CONSTRAINT "auth_session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "bp25"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bp25"."quiz_answer" ADD CONSTRAINT "quiz_answer_question_id_quiz_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "bp25"."quiz_question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bp25"."quiz_question_assignment" ADD CONSTRAINT "quiz_question_assignment_session_id_user_quiz_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "bp25"."user_quiz_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bp25"."quiz_question_assignment" ADD CONSTRAINT "quiz_question_assignment_question_id_quiz_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "bp25"."quiz_question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bp25"."quiz_question_assignment" ADD CONSTRAINT "quiz_question_assignment_user_answer_id_quiz_answer_id_fk" FOREIGN KEY ("user_answer_id") REFERENCES "bp25"."quiz_answer"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bp25"."quiz_question" ADD CONSTRAINT "quiz_question_category_id_quiz_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "bp25"."quiz_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bp25"."secondary_user_stake" ADD CONSTRAINT "secondary_user_stake_session_id_user_quiz_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "bp25"."user_quiz_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bp25"."user_quiz_session" ADD CONSTRAINT "user_quiz_session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "bp25"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_account_userId_idx" ON "admin_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "admin_session_userId_idx" ON "admin_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "admin_verification_identifier_idx" ON "admin_verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "userIdIdx" ON "bp25"."auth_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tokenIdx" ON "bp25"."auth_session" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "walletAddressIdx" ON "bp25"."auth_session" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX "quiz_question_assignment_session_id_idx" ON "bp25"."quiz_question_assignment" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "quiz_question_assignment_question_id_idx" ON "bp25"."quiz_question_assignment" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_question_assignment_session_question_idx" ON "bp25"."quiz_question_assignment" USING btree ("session_id","question_id");--> statement-breakpoint
CREATE INDEX "secondary_user_stake_session_id_idx" ON "bp25"."secondary_user_stake" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "secondary_user_stake_signature_idx" ON "bp25"."secondary_user_stake" USING btree ("signature");--> statement-breakpoint
CREATE INDEX "user_quiz_session_user_id_idx" ON "bp25"."user_quiz_session" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_quiz_sesson_stake_signature_idx" ON "bp25"."user_quiz_session" USING btree ("stake_signature");--> statement-breakpoint
CREATE UNIQUE INDEX "wallet_address_idx" ON "bp25"."users" USING btree ("wallet_address");