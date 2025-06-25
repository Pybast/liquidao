CREATE TABLE "dao_liquidity_pool" (
	"id" serial PRIMARY KEY NOT NULL,
	"dao_name" varchar(256) NOT NULL,
	"dao_token_address" varchar(42) NOT NULL,
	"liquidity_token_address" varchar(42) NOT NULL,
	"tick_spacing" integer NOT NULL,
	"lp_fee" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eligible_addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"dao_id" integer NOT NULL,
	"address" varchar(42) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_dao_address" UNIQUE("dao_id","address")
);
--> statement-breakpoint
ALTER TABLE "eligible_addresses" ADD CONSTRAINT "eligible_addresses_dao_id_dao_liquidity_pool_id_fk" FOREIGN KEY ("dao_id") REFERENCES "public"."dao_liquidity_pool"("id") ON DELETE no action ON UPDATE no action;