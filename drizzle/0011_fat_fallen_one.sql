CREATE TABLE "core"."data_request_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_subject_id" uuid NOT NULL,
	"issuer_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"used_at" timestamp,
	CONSTRAINT "data_request_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "core"."profile_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issuer_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"cpf" varchar(14) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"extra_fields" jsonb DEFAULT '[]'::jsonb,
	"status" varchar(50) DEFAULT 'received' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."wallet_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_subject_id" uuid NOT NULL,
	"issuer_id" uuid NOT NULL,
	"field_name" varchar(255) NOT NULL,
	"field_value" text,
	"received_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core"."data_request_tokens" ADD CONSTRAINT "data_request_tokens_user_subject_id_user_subjects_id_fk" FOREIGN KEY ("user_subject_id") REFERENCES "core"."user_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."data_request_tokens" ADD CONSTRAINT "data_request_tokens_issuer_id_issuers_id_fk" FOREIGN KEY ("issuer_id") REFERENCES "core"."issuers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."profile_submissions" ADD CONSTRAINT "profile_submissions_issuer_id_issuers_id_fk" FOREIGN KEY ("issuer_id") REFERENCES "core"."issuers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."profile_submissions" ADD CONSTRAINT "profile_submissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "core"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."wallet_entries" ADD CONSTRAINT "wallet_entries_user_subject_id_user_subjects_id_fk" FOREIGN KEY ("user_subject_id") REFERENCES "core"."user_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."wallet_entries" ADD CONSTRAINT "wallet_entries_issuer_id_issuers_id_fk" FOREIGN KEY ("issuer_id") REFERENCES "core"."issuers"("id") ON DELETE no action ON UPDATE no action;