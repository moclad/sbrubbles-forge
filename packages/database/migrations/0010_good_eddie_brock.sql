CREATE TABLE "s3_objects" (
	"id" text PRIMARY KEY NOT NULL,
	"bucket" text NOT NULL,
	"fileName" text NOT NULL,
	"originalFileName" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"fileSize" integer,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	CONSTRAINT "s3_objects_fileName_unique" UNIQUE("fileName")
);
--> statement-breakpoint
ALTER TABLE "s3_objects" ADD CONSTRAINT "s3_objects_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "s3_objects" ADD CONSTRAINT "s3_objects_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;