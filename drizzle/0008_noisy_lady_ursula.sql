CREATE TABLE "core"."claim_definition_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_definition_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"json_schema" jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."claim_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(255) NOT NULL,
	"namespace" varchar(100) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"description" text,
	"sensitivity_level" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "claim_definitions_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "core"."partner_claim_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"claim_definition_id" uuid NOT NULL,
	"permission_type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core"."claim_definition_versions" ADD CONSTRAINT "claim_definition_versions_claim_definition_id_claim_definitions_id_fk" FOREIGN KEY ("claim_definition_id") REFERENCES "core"."claim_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."partner_claim_permissions" ADD CONSTRAINT "partner_claim_permissions_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "core"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."partner_claim_permissions" ADD CONSTRAINT "partner_claim_permissions_claim_definition_id_claim_definitions_id_fk" FOREIGN KEY ("claim_definition_id") REFERENCES "core"."claim_definitions"("id") ON DELETE no action ON UPDATE no action;