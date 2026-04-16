CREATE TABLE "expense" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"category_id" text NOT NULL,
	"description" text NOT NULL,
	"amount" real NOT NULL,
	"expense_date" timestamp NOT NULL,
	"location_name" text,
	"location_lat" real,
	"location_lng" real,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_person" (
	"expense_id" text NOT NULL,
	"person_id" text NOT NULL,
	CONSTRAINT "expense_person_expense_id_person_id_pk" PRIMARY KEY("expense_id","person_id")
);
--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_person" ADD CONSTRAINT "expense_person_expense_id_expense_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expense"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_person" ADD CONSTRAINT "expense_person_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;