CREATE TABLE "UserLike" ("userId" TEXT NOT NULL, "comicId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "UserLike_pkey" PRIMARY KEY ("userId","comicId"));
CREATE INDEX "UserLike_userId_createdAt_idx" ON "UserLike"("userId","createdAt");
ALTER TABLE "UserLike" ADD CONSTRAINT "UserLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserLike" ADD CONSTRAINT "UserLike_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
