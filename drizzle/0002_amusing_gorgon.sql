CREATE TABLE "core"."consent_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consent_id" uuid NOT NULL,
	"approved" boolean NOT NULL,
	"receipt_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data_request_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."data_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consumer_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"purpose" varchar(500) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"idempotency_key" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."request_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data_request_id" uuid NOT NULL,
	"claim" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core"."consent_receipts" ADD CONSTRAINT "consent_receipts_consent_id_consents_id_fk" FOREIGN KEY ("consent_id") REFERENCES "core"."consents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."consents" ADD CONSTRAINT "consents_data_request_id_data_requests_id_fk" FOREIGN KEY ("data_request_id") REFERENCES "core"."data_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."data_requests" ADD CONSTRAINT "data_requests_consumer_id_consumers_id_fk" FOREIGN KEY ("consumer_id") REFERENCES "core"."consumers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."data_requests" ADD CONSTRAINT "data_requests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "core"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."request_items" ADD CONSTRAINT "request_items_data_request_id_data_requests_id_fk" FOREIGN KEY ("data_request_id") REFERENCES "core"."data_requests"("id") ON DELETE no action ON UPDATE no action;