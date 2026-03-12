CREATE INDEX IF NOT EXISTS "webhook_deliveries_status_idx" ON "core"."webhook_deliveries" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "webhook_deliveries_subscription_id_idx" ON "core"."webhook_deliveries" ("subscription_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "webhook_deliveries_next_retry_at_idx" ON "core"."webhook_deliveries" ("next_retry_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "webhook_deliveries_created_at_idx" ON "core"."webhook_deliveries" ("created_at");
