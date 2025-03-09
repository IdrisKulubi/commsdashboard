CREATE TABLE "social_engagement_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"business_unit" text NOT NULL,
	"date" timestamp NOT NULL,
	"likes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"saves" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"engagement_rate" numeric(5, 2),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "newsletter_metrics" ADD COLUMN "country" text DEFAULT 'GLOBAL';--> statement-breakpoint
ALTER TABLE "social_metrics" ADD COLUMN "country" text DEFAULT 'GLOBAL';--> statement-breakpoint
ALTER TABLE "website_metrics" ADD COLUMN "country" text DEFAULT 'GLOBAL';