-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "dev";

-- CreateTable
CREATE TABLE "dev"."profile" (
    "id" UUID NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "company" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);
