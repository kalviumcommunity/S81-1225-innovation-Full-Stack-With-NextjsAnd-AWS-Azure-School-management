-- CreateTable
CREATE TABLE "ProjectEnrollment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectEnrollment_projectId_idx" ON "ProjectEnrollment"("projectId");

-- CreateIndex
CREATE INDEX "ProjectEnrollment_userId_idx" ON "ProjectEnrollment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectEnrollment_projectId_userId_key" ON "ProjectEnrollment"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "ProjectEnrollment" ADD CONSTRAINT "ProjectEnrollment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEnrollment" ADD CONSTRAINT "ProjectEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
