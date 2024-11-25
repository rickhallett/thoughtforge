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
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OriginalSource" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "focusPoints" TEXT,
    "tags" TEXT[],
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "queryParams" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,

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
