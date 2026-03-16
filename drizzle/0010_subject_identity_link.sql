ALTER TABLE "core"."data_requests" ADD COLUMN "user_subject_id" uuid;
--> statement-breakpoint
ALTER TABLE "core"."data_requests" ADD CONSTRAINT "data_requests_user_subject_id_user_subjects_id_fk" FOREIGN KEY ("user_subject_id") REFERENCES "core"."user_subjects"("id") ON DELETE no action ON UPDATE no action;
