CREATE TABLE "core"."partner_api_nonces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"nonce_hash" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_api_nonces_nonce_hash_unique" UNIQUE("nonce_hash")
);
--> statement-breakpoint
CREATE TABLE "core"."partner_api_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"route" varchar(500) NOT NULL,
	"method" varchar(10) NOT NULL,
	"status_code" integer NOT NULL,
	"correlation_id" varchar(255),
	"response_time_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core"."integration_credentials" ADD COLUMN "encrypted_secret" text;--> statement-breakpoint
ALTER TABLE "core"."partner_api_nonces" ADD CONSTRAINT "partner_api_nonces_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "core"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."partner_api_usage" ADD CONSTRAINT "partner_api_usage_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "core"."partners"("id") ON DELETE no action ON UPDATE no action;