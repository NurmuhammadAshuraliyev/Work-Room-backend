-- DropForeignKey
ALTER TABLE "public"."companies" DROP CONSTRAINT "companies_user_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."companies" ADD CONSTRAINT "companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
