-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('NEW', 'PROCESSING', 'ENHANCED', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProcessingStage" AS ENUM ('STANDARDIZATION', 'AI_ENHANCEMENT', 'SEO_ENHANCEMENT', 'APPROVAL', 'PUBLISHING');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR', 'USER');

-- CreateEnum
CREATE TYPE "DestinationType" AS ENUM ('BLOG', 'SOCIAL_MEDIA', 'NEWSLETTER', 'OTHER');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('INFO', 'WARN', 'ERROR');

-- CreateTable
CREATE TABLE "_index_config" (
    "name" TEXT NOT NULL,
    "lastUpdateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "_index_config_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OriginalSource" (
    "id" TEXT NOT NULL,
    "sourceType" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255),
    "content" TEXT NOT NULL,
    "focusPoints" TEXT,
    "tags" TEXT[],
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "queryParams" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "OriginalSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "originalSourceId" TEXT NOT NULL,
    "currentStatus" "ContentStatus" NOT NULL DEFAULT 'NEW',
    "content" TEXT,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "approverId" TEXT,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessingLog" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "stage" "ProcessingStage" NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'PROCESSING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "details" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ProcessingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishingQueue" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "actualPublishedAt" TIMESTAMP(3),
    "status" "ContentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "metadata" JSONB NOT NULL,

    CONSTRAINT "PublishingQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueDestination" (
    "id" TEXT NOT NULL,
    "publishingQueueId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,

    CONSTRAINT "QueueDestination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishingDestination" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DestinationType" NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublishingDestination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "contentId" TEXT,
    "processingLogId" TEXT,
    "publishingQueueId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL DEFAULT 'ERROR',
    "metadata" JSONB NOT NULL,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadRawBody" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadRawBody_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentTag" (
    "contentId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ContentTag_pkey" PRIMARY KEY ("contentId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "OriginalSource_sourceType_idx" ON "OriginalSource"("sourceType");

-- CreateIndex
CREATE INDEX "OriginalSource_submittedAt_idx" ON "OriginalSource"("submittedAt");

-- CreateIndex
CREATE INDEX "OriginalSource_deletedAt_idx" ON "OriginalSource"("deletedAt");

-- CreateIndex
CREATE INDEX "Content_currentStatus_idx" ON "Content"("currentStatus");

-- CreateIndex
CREATE INDEX "Content_createdAt_idx" ON "Content"("createdAt");

-- CreateIndex
CREATE INDEX "Content_deletedAt_idx" ON "Content"("deletedAt");

-- CreateIndex
CREATE INDEX "Content_originalSourceId_idx" ON "Content"("originalSourceId");

-- CreateIndex
CREATE INDEX "Content_approverId_idx" ON "Content"("approverId");

-- CreateIndex
CREATE INDEX "ProcessingLog_contentId_idx" ON "ProcessingLog"("contentId");

-- CreateIndex
CREATE INDEX "ProcessingLog_stage_idx" ON "ProcessingLog"("stage");

-- CreateIndex
CREATE INDEX "ProcessingLog_status_idx" ON "ProcessingLog"("status");

-- CreateIndex
CREATE INDEX "ProcessingLog_startedAt_idx" ON "ProcessingLog"("startedAt");

-- CreateIndex
CREATE INDEX "UploadRawBody_uploadedAt_idx" ON "UploadRawBody"("uploadedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_originalSourceId_fkey" FOREIGN KEY ("originalSourceId") REFERENCES "OriginalSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessingLog" ADD CONSTRAINT "ProcessingLog_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishingQueue" ADD CONSTRAINT "PublishingQueue_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueDestination" ADD CONSTRAINT "QueueDestination_publishingQueueId_fkey" FOREIGN KEY ("publishingQueueId") REFERENCES "PublishingQueue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueDestination" ADD CONSTRAINT "QueueDestination_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "PublishingDestination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_processingLogId_fkey" FOREIGN KEY ("processingLogId") REFERENCES "ProcessingLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_publishingQueueId_fkey" FOREIGN KEY ("publishingQueueId") REFERENCES "PublishingQueue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentTag" ADD CONSTRAINT "ContentTag_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentTag" ADD CONSTRAINT "ContentTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
