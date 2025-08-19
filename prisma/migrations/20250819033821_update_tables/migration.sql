/*
  Warnings:

  - You are about to drop the column `created_at` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `user_profile_questions` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `registration_step` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `user_profile_question_answers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[question_text]` on the table `user_profile_questions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."companies" DROP CONSTRAINT "companies_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."selected_answer_options" DROP CONSTRAINT "selected_answer_options_answer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."selected_answer_options" DROP CONSTRAINT "selected_answer_options_option_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_profile_question_answers" DROP CONSTRAINT "user_profile_question_answers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_profile_question_answers" DROP CONSTRAINT "user_profile_question_answers_user_id_fkey";

-- DropIndex
DROP INDEX "public"."users_phone_key";

-- AlterTable
ALTER TABLE "public"."companies" DROP COLUMN "created_at";

-- AlterTable
ALTER TABLE "public"."user_profile_questions" DROP COLUMN "created_at";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "created_at",
DROP COLUMN "registration_step",
DROP COLUMN "updated_at";

-- DropTable
DROP TABLE "public"."user_profile_question_answers";

-- CreateTable
CREATE TABLE "public"."user_profile_question_anwsers" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "answer_text" TEXT NOT NULL,

    CONSTRAINT "user_profile_question_anwsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_question_anwsers_question_id_key" ON "public"."user_profile_question_anwsers"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_questions_question_text_key" ON "public"."user_profile_questions"("question_text");

-- AddForeignKey
ALTER TABLE "public"."user_profile_question_anwsers" ADD CONSTRAINT "user_profile_question_anwsers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."user_profile_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."selected_answer_options" ADD CONSTRAINT "selected_answer_options_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "public"."user_profile_question_anwsers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."companies" ADD CONSTRAINT "companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
