CREATE INDEX IF NOT EXISTS "audit_events_event_type_idx" ON "core"."audit_events" ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_events_aggregate_id_idx" ON "core"."audit_events" ("aggregate_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_events_created_at_idx" ON "core"."audit_events" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "billable_events_event_type_idx" ON "core"."billable_events" ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "billable_events_tenant_id_idx" ON "core"."billable_events" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "billable_events_data_request_id_idx" ON "core"."billable_events" ("data_request_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "billable_events_created_at_idx" ON "core"."billable_events" ("created_at");
