CREATE TABLE "failed_message" (
	"id" text PRIMARY KEY NOT NULL,
	"message_text" text NOT NULL,
	"source" text NOT NULL,
	"error_message" text NOT NULL,
	"metadata" text,
	"resolved_at" timestamp,
	"created_at" timestamp NOT NULL
);
