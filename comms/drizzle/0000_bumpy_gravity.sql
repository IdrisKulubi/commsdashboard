CREATE TABLE "newsletter_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_unit" text NOT NULL,
	"date" timestamp NOT NULL,
	"recipients" integer,
	"open_rate" numeric(5, 2),
	"number_of_emails" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "social_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"business_unit" text NOT NULL,
	"date" timestamp NOT NULL,
	"impressions" integer,
	"followers" integer,
	"number_of_posts" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "website_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_unit" text NOT NULL,
	"date" timestamp NOT NULL,
	"users" integer,
	"clicks" integer,
	"sessions" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
