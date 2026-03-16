CREATE TABLE "core"."consent_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"max_duration_hours" integer NOT NULL,
	"allowed_claims" jsonb DEFAULT '[]'::jsonb,
	"jurisdiction" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."consent_revocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consent_id" uuid NOT NULL,
	"reason" varchar(500),
	"revoked_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core"."consent_policies" ADD CONSTRAINT "consent_policies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "core"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."consent_revocations" ADD CONSTRAINT "consent_revocations_consent_id_consents_id_fk" FOREIGN KEY ("consent_id") REFERENCES "core"."consents"("id") ON DELETE no action ON UPDATE no action;