CREATE TABLE "core"."credential_references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_subject_id" uuid NOT NULL,
	"issuer_id" uuid NOT NULL,
	"claim_definition_id" uuid,
	"external_credential_ref" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"issued_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."presentation_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data_request_id" uuid NOT NULL,
	"user_subject_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."user_subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"external_subject_ref" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core"."credential_references" ADD CONSTRAINT "credential_references_user_subject_id_user_subjects_id_fk" FOREIGN KEY ("user_subject_id") REFERENCES "core"."user_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."credential_references" ADD CONSTRAINT "credential_references_issuer_id_issuers_id_fk" FOREIGN KEY ("issuer_id") REFERENCES "core"."issuers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."credential_references" ADD CONSTRAINT "credential_references_claim_definition_id_claim_definitions_id_fk" FOREIGN KEY ("claim_definition_id") REFERENCES "core"."claim_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."presentation_sessions" ADD CONSTRAINT "presentation_sessions_data_request_id_data_requests_id_fk" FOREIGN KEY ("data_request_id") REFERENCES "core"."data_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."presentation_sessions" ADD CONSTRAINT "presentation_sessions_user_subject_id_user_subjects_id_fk" FOREIGN KEY ("user_subject_id") REFERENCES "core"."user_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."user_subjects" ADD CONSTRAINT "user_subjects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "core"."tenants"("id") ON DELETE no action ON UPDATE no action;