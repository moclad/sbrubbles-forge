CREATE TABLE "jwks" (
	"created_at" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"private_key" text NOT NULL,
	"public_key" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invitation" ALTER COLUMN "role" SET DATA TYPE "public"."Role" USING "role"::"public"."Role";--> statement-breakpoint
ALTER TABLE "invitation" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."Role";--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "role" SET DATA TYPE "public"."Role" USING "role"::"public"."Role";--> statement-breakpoint
ALTER TABLE "passkey" ADD COLUMN "aaguid" text;