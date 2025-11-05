CREATE SCHEMA "bp25";
--> statement-breakpoint
CREATE TABLE "bp25"."auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_address" varchar(44) NOT NULL,
	"token" varchar(500) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_accessed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "bp25"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" varchar(44) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_walletAddress_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
ALTER TABLE "bp25"."auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "bp25"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "userIdIdx" ON "bp25"."auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tokenIdx" ON "bp25"."auth_sessions" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "walletAddressIdx" ON "bp25"."auth_sessions" USING btree ("wallet_address");--> statement-breakpoint
CREATE UNIQUE INDEX "wallet_address_idx" ON "bp25"."users" USING btree ("wallet_address");