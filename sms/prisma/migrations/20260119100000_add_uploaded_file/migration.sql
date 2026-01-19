-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UploadedFile_uploaderId_idx" ON "UploadedFile"("uploaderId");

-- CreateIndex
CREATE INDEX "UploadedFile_provider_idx" ON "UploadedFile"("provider");

-- CreateIndex
CREATE INDEX "UploadedFile_bucket_idx" ON "UploadedFile"("bucket");

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
