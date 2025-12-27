ALTER TABLE "listings" RENAME COLUMN "agent_id" TO "creator_id";--> statement-breakpoint
ALTER TABLE "listings" DROP CONSTRAINT "listings_agent_id_agents_user_id_fk";
--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;